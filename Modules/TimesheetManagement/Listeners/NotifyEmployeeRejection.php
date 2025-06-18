<?php

namespace Modules\TimesheetManagement\Listeners;

use Modules\TimesheetManagement\Events\TimesheetRejected;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Notification;
use Modules\TimesheetManagement\Notifications\TimesheetRejectedNotification;

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
     * @return void;
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     *
     * @param  TimesheetRejected  $event
     * @return void;
     */
    public function handle(TimesheetRejected $event)
    {
        // Check if notification is enabled in config
        if (!config('timesheetmanagement.notifications.notify_employee_on_rejection', true)) {
            return;
        }

        $employee = $event->timesheet->employee;

        // Skip if employee record doesn't exist or employee has no user
        if (!$employee || !$employee->user) {
            return;
        }

        // Send notification to employee
        Notification::send($employee->user, new TimesheetRejectedNotification($event->timesheet));
    }

    /**
     * Handle a job failure.
     *
     * @param  TimesheetRejected  $event
     * @param  \Throwable  $exception
     * @return void;
     */
    public function failed(TimesheetRejected $event, \Throwable $exception)
    {
        // Log the failure
        \Log::error('Failed to send employee notification for timesheet rejection: ' . $exception->getMessage(), [
            'timesheet_id' => $event->timesheet->id,
            'exception' => $exception,
        ]);
    }
}


