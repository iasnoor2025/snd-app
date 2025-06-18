<?php

namespace Modules\LeaveManagement\Events;

use Illuminate\Queue\SerializesModels;
use Modules\LeaveManagement\Domain\Models\Leave;

class LeaveApproved
{
    use SerializesModels;

    /**
     * The leave instance.
     *
     * @var \Modules\LeaveManagement\Domain\Models\Leave
     */
    public $leave;

    /**
     * Create a new event instance.
     *
     * @param  \Modules\LeaveManagement\Domain\Models\Leave  $leave
     * @return void
     */
    public function __construct(Leave $leave)
    {
        $this->leave = $leave;
    }

    /**
     * Get the channels the event should be broadcast on.
     *
     * @return array
     */
    public function broadcastOn()
    {
        return [];
    }
}
