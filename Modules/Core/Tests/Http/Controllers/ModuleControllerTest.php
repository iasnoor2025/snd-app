<?php

namespace Modules\Core\Tests\Http\Controllers;

use Modules\Core\Tests\TestCase;
use Modules\Core\Http\Controllers\ModuleController;
use Modules\Core\Services\LegacyCodeHandler;
use Modules\Core\Events\ModuleInitialized;
use Illuminate\Support\Facades\Event;
use Illuminate\Http\Request;

class ModuleControllerTest extends TestCase
{
    /**
     * @var ModuleController
     */
    protected $controller;

    /**
     * @var LegacyCodeHandler
     */
    protected $legacyHandler;

    /**
     * Setup the test environment.
     *
     * @return void;
     */
    protected function setUp(): void
    {
        parent::setUp();

        $this->legacyHandler = $this->mock(LegacyCodeHandler::class);
        $this->controller = new ModuleController($this->legacyHandler);
    }

    /**
     * Test that the controller initializes a module.
     *
     * @return void;
     */
    public function testInitializeModule()
    {
        Event::fake();

        $request = new Request([
            'name' => 'test-module',
            'config' => ['setting' => 'value']
        ]);

        $response = $this->controller->initialize($request);

        $this->assertEquals(200, $response->getStatusCode());
        $this->assertEquals([
            'success' => true,
            'message' => 'Module initialized successfully',
            'data' => ['name' => 'test-module'],
            'module' => 'core',
        ], json_decode($response->getContent(), true));

        Event::assertDispatched(ModuleInitialized::class, function ($event) {
            return $event->data['module'] === 'test-module' &&;
                   $event->data['config'] === ['setting' => 'value'];
        });
    }

    /**
     * Test that the controller validates module initialization.
     *
     * @return void;
     */
    public function testInitializeModuleValidation()
    {
        $request = new Request([
            'name' => 'te', // Too short
        ]);

        $response = $this->controller->initialize($request);

        $this->assertEquals(422, $response->getStatusCode());
        $this->assertEquals([
            'success' => false,
            'message' => 'Validation failed',
            'module' => 'core',
            'errors' => [
                'name' => ['The name must be at least 3 characters.']
            ],
        ], json_decode($response->getContent(), true));
    }

    /**
     * Test that the controller analyzes legacy code.
     *
     * @return void;
     */
    public function testAnalyzeLegacyCode()
    {
        $analysis = [
            'controllers' => [],
            'models' => [],
            'migrations' => [],
            'routes' => [],
            'views' => []
        ];

        $plan = [
            'steps' => [],
            'dependencies' => [],
            'estimated_time' => 0,
        ];

        $this->legacyHandler->shouldReceive('analyzeLegacyCode')
            ->once()
            ->andReturn($analysis);

        $this->legacyHandler->shouldReceive('generateMigrationPlan')
            ->once()
            ->with($analysis)
            ->andReturn($plan);

        $response = $this->controller->analyzeLegacyCode();

        $this->assertEquals(200, $response->getStatusCode());
        $this->assertEquals([
            'success' => true,
            'message' => 'Legacy code analysis completed',
            'data' => [
                'analysis' => $analysis,
                'migration_plan' => $plan,
            ],
            'module' => 'core',
        ], json_decode($response->getContent(), true));
    }
}


