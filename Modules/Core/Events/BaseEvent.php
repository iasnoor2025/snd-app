<?php

namespace Modules\Core\Events;

use Illuminate\Queue\SerializesModels;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

abstract class BaseEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * The event data.
     *
     * @var array
     */
    public $data;

    /**
     * Create a new event instance.
     *
     * @param  array  $data
     * @return void;
     */
    public function __construct(array $data = [])
    {
        $this->data = $data;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array;
     */
    public function broadcastOn()
    {
        return [];
    }

    /**
     * Get the broadcast event name.
     *
     * @return string;
     */
    public function broadcastAs()
    {
        return class_basename($this);
    }

    /**
     * Get the data to broadcast.
     *
     * @return array;
     */
    public function broadcastWith()
    {
        return $this->data;
    }
}



