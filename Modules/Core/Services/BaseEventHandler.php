<?php

namespace Modules\Core\Services;

use Illuminate\Events\Dispatcher;
use Illuminate\Support\Facades\Log;

abstract class BaseEventHandler
{
    /**
     * The event dispatcher instance.
     *
     * @var \Illuminate\Events\Dispatcher
     */
    protected $dispatcher;

    /**
     * Create a new event handler instance.
     *
     * @param  \Illuminate\Events\Dispatcher  $dispatcher
     * @return void;
     */
    public function __construct(Dispatcher $dispatcher)
    {
        $this->dispatcher = $dispatcher;
    }

    /**
     * Register the listeners for the subscriber.
     *
     * @param  \Illuminate\Events\Dispatcher  $events
     * @return void;
     */
    public function subscribe($events)
    {
        foreach ($this->getSubscribedEvents() as $event => $listener) {
            $events->listen($event, [$this, $listener]);
        }
    }

    /**
     * Get the events that the handler subscribes to.
     *
     * @return array;
     */
    abstract public function getSubscribedEvents();

    /**
     * Handle the event.
     *
     * @param  string  $event
     * @param  array  $data
     * @return void;
     */
    protected function handleEvent($event, array $data = [])
    {
        try {
            $this->dispatcher->dispatch($event, $data);
        } catch (\Exception $e) {
            Log::error("Error handling event {$event}: " . $e->getMessage(), [
                'event' => $event,
                'data' => $data,
                'exception' => $e,
            ]);
        }
    }

    /**
     * Log an event.
     *
     * @param  string  $event
     * @param  array  $data
     * @return void;
     */
    protected function logEvent($event, array $data = [])
    {
        Log::info("Event {$event} dispatched", [
            'event' => $event,
            'data' => $data,
        ]);
    }
}


