<?php

namespace Modules\TimesheetManagement\Listeners;

use Modules\TimesheetManagement\Events\TimesheetSubmitted;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Notification;
use Modules\TimesheetManagement\Notifications\TimesheetSubmittedNotification;
use Modules\Core\Domain\Models\User;

class NotifyManager implements ShouldQueue
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
     * @param  TimesheetSubmitted  $event
     * @return void
     */
    public function handle(TimesheetSubmitted $event)
    {
        // Check if notification is enabled in config
        if (!config('timesheetmanagement.notifications.notify_manager_on_submission', true)) {
            return;
        }

        $employee = $event->timesheet->employee;

        // Skip if employee doesn't have a manager
        if (!$employee || !$employee->manager_id) {
            return;
        }

        // Get the manager
        $manager = User::find($employee->manager_id);

        if ($manager) {
            // Send notification to manager
            Notification::send($manager, new TimesheetSubmittedNotification($event->timesheet));
        }
    }

    /**
     * Handle a job failure.
     *
     * @param  TimesheetSubmitted  $event
     * @param  \Throwable  $exception
     * @return void
     */
    public function failed(TimesheetSubmitted $event, \Throwable $exception)
    {
        // Log the failure
        \Log::error('Failed to send manager notification for timesheet submission: ' . $exception->getMessage(), [
            'timesheet_id' => $event->timesheet->id,
            'exception' => $exception,
        ]);
    }
}


