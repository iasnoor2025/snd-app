<?php

namespace Modules\TimesheetManagement\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Modules\EmployeeManagement\Domain\Models\Employee;

class TimesheetReminderNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly Employee $employee) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Timesheet Submission Reminder')
            ->greeting("Hello {$this->employee->first_name},")
            ->line('This is a friendly reminder to submit your timesheet for this week.')
            ->action('Submit Timesheet', url('/timesheets'))
            ->line('Thank you for your attention!');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'message' => 'Please submit your timesheet for this week.',
        ];
    }
}
