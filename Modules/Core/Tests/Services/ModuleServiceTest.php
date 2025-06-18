<?php

namespace Modules\Core\Tests\Services;

use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Event;
use Modules\Core\Events\ModuleInitialized;
use Modules\Core\Events\ModuleConfigured;
use Modules\Core\Exceptions\ModuleNotFoundException;
use Modules\Core\Exceptions\ModuleInitializationException;
use Modules\Core\Services\ModuleService;
use Tests\TestCase;

class ModuleServiceTest extends TestCase
{
    protected ModuleService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new ModuleService();
    }

    /** @test */
    public function it_gets_all_modules()
    {
        Config::set('modules.enabled', ['test-module']);
        Config::set('modules.test-module.description', 'Test Description');
        Config::set('modules.test-module.status', 'active');
        Config::set('modules.test-module.config', ['key' => 'value']);

        $modules = $this->service->getAllModules();

        $this->assertCount(1, $modules);
        $this->assertEquals('test-module', $modules->first()['name']);
        $this->assertEquals('Test Description', $modules->first()['description']);
        $this->assertEquals('active', $modules->first()['status']);
        $this->assertEquals(['key' => 'value'], $modules->first()['config']);
    }

    /** @test */
    public function it_gets_specific_module()
    {
        Config::set('modules.enabled', ['test-module']);
        Config::set('modules.test-module.description', 'Test Description');
        Config::set('modules.test-module.status', 'active');
        Config::set('modules.test-module.config', ['key' => 'value']);

        $module = $this->service->getModule('test-module');

        $this->assertEquals('test-module', $module['name']);
        $this->assertEquals('Test Description', $module['description']);
        $this->assertEquals('active', $module['status']);
        $this->assertEquals(['key' => 'value'], $module['config']);
    }

    /** @test */
    public function it_throws_exception_when_module_not_found()
    {
        $this->expectException(ModuleNotFoundException::class);

        $this->service->getModule('non-existent-module');
    }

    /** @test */
    public function it_initializes_module()
    {
        Event::fake();
        Config::set('modules.enabled', ['test-module']);

        $this->service->initializeModule('test-module');

        Event::assertDispatched(ModuleInitialized::class);
        $this->assertEquals('active', Config::get('modules.test-module.status'));
    }

    /** @test */
    public function it_throws_exception_when_initialization_fails()
    {
        Event::fake();
        Config::set('modules.enabled', ['test-module']);
        Event::shouldReceive('dispatch')
            ->andThrow(new \Exception('Initialization failed'));

        $this->expectException(ModuleInitializationException::class);

        $this->service->initializeModule('test-module');
    }

    /** @test */
    public function it_configures_module()
    {
        Event::fake();
        Config::set('modules.enabled', ['test-module']);

        $settings = ['setting1' => 'value1', 'setting2' => 'value2'];
        $this->service->configureModule('test-module', $settings);

        Event::assertDispatched(ModuleConfigured::class);
        $this->assertEquals($settings, Config::get('modules.test-module.config'));
    }

    /** @test */
    public function it_gets_module_status()
    {
        Config::set('modules.test-module.status', 'active');

        $status = $this->service->getModuleStatus('test-module');

        $this->assertEquals('active', $status);
    }

    /** @test */
    public function it_returns_inactive_status_for_unknown_module()
    {
        $status = $this->service->getModuleStatus('unknown-module');

        $this->assertEquals('inactive', $status);
    }
}

