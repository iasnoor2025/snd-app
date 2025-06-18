<?php

namespace Modules\Core\Tests\Events;

use Modules\Core\Tests\TestCase;
use Modules\Core\Events\ModuleInitialized;

class ModuleInitializedTest extends TestCase
{
    /**
     * Test that the event is properly constructed.
     *
     * @return void;
     */
    public function testEventConstruction()
    {
        $moduleName = 'test-module';
        $config = ['setting' => 'value'];

        $event = new ModuleInitialized($moduleName, $config);

        $this->assertEquals('core.module.initialized', $event->eventName);
        $this->assertEquals($moduleName, $event->data['module']);
        $this->assertEquals($config, $event->data['config']);
        $this->assertArrayHasKey('timestamp', $event->data);
    }

    /**
     * Test that the event broadcasts with the correct data.
     *
     * @return void;
     */
    public function testBroadcastWith()
    {
        $moduleName = 'test-module';
        $config = ['setting' => 'value'];

        $event = new ModuleInitialized($moduleName, $config);
        $broadcastData = $event->broadcastWith();

        $this->assertEquals($moduleName, $broadcastData['module']);
        $this->assertEquals($config, $broadcastData['config']);
        $this->assertArrayHasKey('timestamp', $broadcastData);
    }
}


