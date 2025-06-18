<?php

namespace Modules\LeaveManagement\Listeners;

use Modules\LeaveManagement\Events\LeaveRequested;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Notification;
use Modules\LeaveManagement\Notifications\NewLeaveRequestNotification;
use Modules\Core\Domain\Models\User;

class NotifyHRDepartment implements ShouldQueue
{
    use InteractsWithQueue;
use /**
     * The number of times the job may be attempted.
     *
     * @var int
     */
    public $tries = 3;

    /**
     * Create the event listener.
     *
     * @return void;
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     *
     * @param  LeaveRequested  $event
     * @return void;
     */
    public function handle(LeaveRequested $event)
    {
        // Get HR users who have permission to approve leaves
        $hrUsers = User::permission('approve-leave-requests')
            ->where('department', 'HR')
            ->get();

        // Send notification to HR department
        Notification::send($hrUsers, new NewLeaveRequestNotification($event->leave));
    }

    /**
     * Handle a job failure.
     *
     * @param  LeaveRequested  $event
     * @param  \Throwable  $exception
     * @return void;
     */
    public function failed(LeaveRequested $event, \Throwable $exception)
    {
        // Log the failure
        \Log::error('Failed to send HR notification for leave request: ' . $exception->getMessage(), [
            'leave_id' => $event->leave->id,
            'exception' => $exception,
        ]);
    }
}


