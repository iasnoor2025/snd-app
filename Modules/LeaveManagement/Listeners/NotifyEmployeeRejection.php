<?php

namespace Modules\LeaveManagement\Listeners;

use Modules\LeaveManagement\Events\LeaveRejected;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Modules\LeaveManagement\Notifications\LeaveRejectedNotification;

class NotifyEmployeeRejection implements ShouldQueue
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
     * @param  LeaveRejected  $event
     * @return void
     */
    public function handle(LeaveRejected $event)
    {
        // Get the employee who requested the leave
        $employee = $event->leave->employee;

        if ($employee && $employee->user) {
            // Send notification to employee
            $employee->user->notify(new LeaveRejectedNotification($event->leave));
        }
    }

    /**
     * Handle a job failure.
     *
     * @param  LeaveRejected  $event
     * @param  \Throwable  $exception
     * @return void
     */
    public function failed(LeaveRejected $event, $exception)
    {
        // Log the failure or handle it appropriately
        \Log::error('Failed to notify employee about leave rejection', [
            'leave_id' => $event->leave->id,
            'employee_id' => $event->leave->employee_id,
            'exception' => $exception->getMessage()
        ]);
    }
}
