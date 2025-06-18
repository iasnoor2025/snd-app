<?php

namespace Modules\Core\Tests\Services;

use Modules\Core\Tests\TestCase;
use Modules\Core\Services\BaseEventHandler;
use Illuminate\Events\Dispatcher;
use Illuminate\Support\Facades\Log;
use Mockery;

class BaseEventHandlerTest extends TestCase
{
    /**
     * @var \Mockery\MockInterface
     */
    protected $dispatcher;

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

        $this->dispatcher = Mockery::mock(Dispatcher::class);
        $this->handler = new class($this->dispatcher) extends BaseEventHandler {
            public function getSubscribedEvents()
            {
                return [
                    'test.event' => 'handleTestEvent'
                ];
            }

            public function handleTestEvent($event, $data)
            {
                $this->handleEvent($event, $data);
            }
        };
    }

    /**
     * Clean up the test environment.
     *
     * @return void;
     */
    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    /**
     * Test that the handler subscribes to events.
     *
     * @return void;
     */
    public function testHandlerSubscribesToEvents()
    {
        $this->dispatcher->shouldReceive('listen')
            ->once()
            ->with('test.event', [$this->handler, 'handleTestEvent']);

        $this->handler->subscribe($this->dispatcher);
    }

    /**
     * Test that the handler dispatches events.
     *
     * @return void;
     */
    public function testHandlerDispatchesEvents()
    {
        $event = 'test.event';
        $data = ['key' => 'value'];

        $this->dispatcher->shouldReceive('dispatch')
            ->once()
            ->with($event, $data);

        $this->handler->handleTestEvent($event, $data);
    }

    /**
     * Test that the handler logs events.
     *
     * @return void;
     */
    public function testHandlerLogsEvents()
    {
        Log::shouldReceive('info')
            ->once()
            ->with('Event test.event dispatched', [
                'event' => 'test.event',
                'data' => ['key' => 'value']
            ]);

        $this->handler->logEvent('test.event', ['key' => 'value']);
    }

    /**
     * Test that the handler handles event errors.
     *
     * @return void;
     */
    public function testHandlerHandlesEventErrors()
    {
        $event = 'test.event';
        $data = ['key' => 'value'];
        $exception = new \Exception('Test error');

        $this->dispatcher->shouldReceive('dispatch')
            ->once()
            ->with($event, $data)
            ->andThrow($exception);

        Log::shouldReceive('error')
            ->once()
            ->with('Error handling event test.event: Test error', [
                'event' => $event,
                'data' => $data,
                'exception' => $exception,
            ]);

        $this->handler->handleTestEvent($event, $data);
    }
}


