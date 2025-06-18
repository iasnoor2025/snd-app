<?php

namespace Modules\Core\Tests\Events;

use Modules\Core\Tests\TestCase;
use Modules\Core\Events\BaseEvent;

class BaseEventTest extends TestCase
{
    /**
     * Test that the event is properly constructed.
     *
     * @return void;
     */
    public function testEventConstruction()
    {
        $event = new class(['test' => 'data']) extends BaseEvent {
            protected function getEventName(): string
            {
                return 'test.event';
            }
        };

        $this->assertEquals('test.event', $event->eventName);
        $this->assertEquals(['test' => 'data'], $event->data);
    }

    /**
     * Test that the event broadcasts on the correct channel.
     *
     * @return void;
     */
    public function testBroadcastChannel()
    {
        $event = new class([]) extends BaseEvent {
            protected function getEventName(): string
            {
                return 'test.event';
            }
        };

        $this->assertEquals(['core'], $event->broadcastOn());
    }

    /**
     * Test that the event broadcasts with the correct name.
     *
     * @return void;
     */
    public function testBroadcastAs()
    {
        $event = new class([]) extends BaseEvent {
            protected function getEventName(): string
            {
                return 'test.event';
            }
        };

        $this->assertEquals('test.event', $event->broadcastAs());
    }

    /**
     * Test that the event broadcasts with the correct data.
     *
     * @return void;
     */
    public function testBroadcastWith()
    {
        $data = ['test' => 'data'];
        $event = new class($data) extends BaseEvent {
            protected function getEventName(): string
            {
                return 'test.event';
            }
        };

        $this->assertEquals($data, $event->broadcastWith());
    }
}


