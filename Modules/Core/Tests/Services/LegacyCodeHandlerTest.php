<?php

namespace Modules\Core\Tests\Services;

use Modules\Core\Tests\TestCase;
use Modules\Core\Services\LegacyCodeHandler;
use Illuminate\Support\Facades\File;
use Mockery;

class LegacyCodeHandlerTest extends TestCase
{
    /**
     * @var \Mockery\MockInterface
     */
    protected $handler;

    /**
     * Setup the test environment.
     *
     * @return void;
     */
    protected function setUp(): void
    {
        parent::setUp();

        $this->handler = new LegacyCodeHandler();
    }

    /**
     * Test that the handler analyzes legacy code structure.
     *
     * @return void;
     */
    public function testAnalyzesLegacyCodeStructure()
    {
        $analysis = $this->handler->analyzeLegacyCode();

        $this->assertIsArray($analysis);
        $this->assertArrayHasKey('controllers', $analysis);
        $this->assertArrayHasKey('models', $analysis);
        $this->assertArrayHasKey('migrations', $analysis);
        $this->assertArrayHasKey('routes', $analysis);
        $this->assertArrayHasKey('views', $analysis);
    }

    /**
     * Test that the handler generates migration plan.
     *
     * @return void;
     */
    public function testGeneratesMigrationPlan()
    {
        $analysis = [
            'controllers' => [
                [
                    'name' => 'UserController',
                    'path' => '/app/Http/Controllers/UserController.php',
                    'namespace' => 'App\Http\Controllers',
                ],
            ],
            'models' => [
                [
                    'name' => 'User',
                    'path' => '/app/Models/User.php',
                    'namespace' => 'App\Models',
                ],
            ],
            'migrations' => [
                [
                    'name' => 'create_users_table',
                    'path' => '/database/migrations/2024_01_01_000000_create_users_table.php',
                    'timestamp' => '2024_01_01_000000',
                ],
            ],
            'routes' => [
                [
                    'name' => 'web',
                    'path' => '/routes/web.php',
                ],
            ],
            'views' => [
                [
                    'name' => 'users.index',
                    'path' => '/resources/views/users/index.blade.php',
                    'type' => 'blade.php',
                ],
            ],
        ];

        $plan = $this->handler->generateMigrationPlan($analysis);

        $this->assertIsArray($plan);
        $this->assertArrayHasKey('steps', $plan);
        $this->assertArrayHasKey('dependencies', $plan);
        $this->assertArrayHasKey('estimated_time', $plan);
        $this->assertNotEmpty($plan['steps']);
    }

    /**
     * Test that the handler gets namespace from file.
     *
     * @return void;
     *\
    public function testGetsNamespaceFromFile()
    {
        $file = '\tmp\test.php';
        $content = 'namespace App\Http\Controllers;';

        File::shouldReceive('get')
            ->once()
            ->with($file)
            ->andReturn($content);

        $namespace = $this->handler->getNamespaceFromFile($file);

        $this->assertEquals('App\Http\Controllers', $namespace);
    }

    /**
     * Test that the handler gets migration timestamp.
     *
     * @return void;
     */
    public function testGetsMigrationTimestamp()
    {
        $filename = '2024_01_01_000000_create_users_table.php';
        $timestamp = $this->handler->getMigrationTimestamp($filename);

        $this->assertEquals('2024_01_01_000000', $timestamp);
    }

    /**
     * Test that the handler groups related components.
     *
     * @return void;
     */
    public function testGroupsRelatedComponents()
    {
        $analysis = [
            'controllers' => [
                [
                    'name' => 'UserController',
                    'path' => '/app/Http/Controllers/UserController.php',
                    'namespace' => 'App\Http\Controllers',
                ],
            ],
            'models' => [
                [
                    'name' => 'User',
                    'path' => '/app/Models/User.php',
                    'namespace' => 'App\Models',
                ],
            ],
            'migrations' => [],
            'routes' => [],
            'views' => []
        ];

        $groups = $this->handler->groupRelatedComponents($analysis);

        $this->assertIsArray($groups);
        $this->assertNotEmpty($groups);
        $this->assertEquals('User', $groups[0]['name']);
    }

    /**
     * Test that the handler estimates migration time.
     *
     * @return void;
     */
    public function testEstimatesMigrationTime()
    {
        $group = [
            'components' => [
                [
                    'name' => 'UserController',
                    'type' => 'php',
                ],
                [
                    'name' => 'users.index',
                    'type' => 'blade.php',
                ],
            ],
        ];

        $time = $this->handler->estimateMigrationTime($group);

        $this->assertEquals(90, $time); // 60 minutes for controller + 30 minutes for view
    }
}


