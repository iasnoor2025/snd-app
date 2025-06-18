<?php

namespace Modules\LeaveManagement\Listeners;

use Modules\LeaveManagement\Events\LeaveRequested;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Notification;
use Modules\LeaveManagement\Notifications\NewLeaveRequestNotification;
use Modules\Core\Domain\Models\User;

class NotifySupervisor implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * The number of times the job may be attempted.
     *
     * @var int
     */
    public $tries = 3;

    /**
     * Create the event listener.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     *
     * @param  LeaveRequested  $event
     * @return void
     */
    public function handle(LeaveRequested $event)
    {
        // Get the employee's supervisor
        $supervisor = $event->leave->employee->supervisor;

        if ($supervisor && $supervisor->user) {
            // Send notification to supervisor
            $supervisor->user->notify(new NewLeaveRequestNotification($event->leave));
        }
    }

    /**
     * Handle a job failure.
     *
     * @param  LeaveRequested  $event
     * @param  \Throwable  $exception
     * @return void
     */
    public function failed(LeaveRequested $event, $exception)
    {
        // Log the failure or handle it appropriately
        \Log::error('Failed to notify supervisor about leave request', [
            'leave_id' => $event->leave->id,
            'exception' => $exception->getMessage()
        ]);
    }
}
