<?php

namespace Modules\TimesheetManagement\Listeners;

use Modules\TimesheetManagement\Events\TimesheetApproved;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Notification;
use Modules\TimesheetManagement\Notifications\TimesheetApprovedNotification;

class NotifyEmployee implements ShouldQueue
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
     * @param  TimesheetApproved  $event
     * @return void;
     */
    public function handle(TimesheetApproved $event)
    {
        // Check if notification is enabled in config
        if (!config('timesheetmanagement.notifications.notify_employee_on_approval', true)) {
            return;
        }

        $employee = $event->timesheet->employee;

        // Skip if employee record doesn't exist or employee has no user
        if (!$employee || !$employee->user) {
            return;
        }

        // Send notification to employee
        Notification::send($employee->user, new TimesheetApprovedNotification($event->timesheet));
    }

    /**
     * Handle a job failure.
     *
     * @param  TimesheetApproved  $event
     * @param  \Throwable  $exception
     * @return void;
     */
    public function failed(TimesheetApproved $event, \Throwable $exception)
    {
        // Log the failure
        \Log::error('Failed to send employee notification for timesheet approval: ' . $exception->getMessage(), [
            'timesheet_id' => $event->timesheet->id,
            'exception' => $exception,
        ]);
    }
}


