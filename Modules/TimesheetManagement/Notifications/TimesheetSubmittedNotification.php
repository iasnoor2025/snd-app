<?php

namespace Modules\TimesheetManagement\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

class TimesheetSubmittedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * The timesheet instance.
     *
     * @var \Modules\TimesheetManagement\Domain\Models\WeeklyTimesheet
     */
    protected $timesheet;

    /**
     * Create a new notification instance.
     *
     * @param  \Modules\TimesheetManagement\Domain\Models\WeeklyTimesheet  $timesheet
     * @return void
     */
    public function __construct(WeeklyTimesheet $timesheet)
    {
        $this->timesheet = $timesheet;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return \\Illuminate\\Notifications\\Messages\\MailMessage
     */
    public function toMail($notifiable)
    {
        $url = route('timesheets.approvals.index', ['employee_id' => $this->timesheet->employee_id]);

        return (new MailMessage)
            ->subject('Timesheet Submitted for Approval')
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line($this->timesheet->employee->user->name . ' has submitted their timesheet for approval.')
            ->line('Week: ' . $this->timesheet->week_start_date->format('M d, Y') . ' to ' . $this->timesheet->week_end_date->format('M d, Y'))
            ->line('Total Hours: ' . $this->timesheet->total_hours)
            ->line('Regular Hours: ' . $this->timesheet->regular_hours)
            ->line('Overtime Hours: ' . $this->timesheet->overtime_hours)
            ->action('Review Timesheets', $url)
            ->line('Please review and approve or reject this timesheet.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function toArray($notifiable)
    {
        return [
            'timesheet_id' => $this->timesheet->id,
            'employee_id' => $this->timesheet->employee_id,
            'employee_name' => $this->timesheet->employee->user->name ?? 'Unknown',
            'week_start' => $this->timesheet->week_start_date->format('Y-m-d'),
            'week_end' => $this->timesheet->week_end_date->format('Y-m-d'),
            'total_hours' => $this->timesheet->total_hours,
            'submitted_at' => $this->timesheet->submitted_at->format('Y-m-d H:i:s'),
            'status' => 'submitted',
            'message' => $this->timesheet->employee->user->name . ' has submitted their timesheet for approval.',
            'url' => route('timesheets.approvals.index', ['employee_id' => $this->timesheet->employee_id])
        ];
    }
}


