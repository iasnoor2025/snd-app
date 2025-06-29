<?php

namespace Modules\TimesheetManagement\Console\Commands;

use Illuminate\Console\Command;
use Modules\EmployeeManagement\Domain\Models\Employee;
use Illuminate\Support\Facades\Notification;
use Modules\TimesheetManagement\Notifications\TimesheetReminderNotification;
use Carbon\Carbon;

class SendTimesheetReminders extends Command
{
    protected $signature = 'timesheet:send-reminders';
    protected $description = 'Send automated timesheet submission reminders to employees';

    public function handle(): void
    {
        $this->info('Sending timesheet submission reminders...');
        $today = Carbon::now();
        $reminderDay = config('timesheetmanagement.notifications.reminder_day', 5); // Default: Friday
        $sendWeekly = config('timesheetmanagement.notifications.send_weekly_reminders', true);
        $sendDaily = config('timesheetmanagement.notifications.send_daily_reminders', false);

        if (($sendWeekly && $today->dayOfWeekIso === $reminderDay) || $sendDaily) {
            $employees = Employee::all();
            foreach ($employees as $employee) {
                Notification::route('mail', $employee->email)
                    ->notify(new TimesheetReminderNotification($employee));
            }
            $this->info('Reminders sent.');
        } else {
            $this->info('Not a reminder day. No reminders sent.');
        }
    }
}
