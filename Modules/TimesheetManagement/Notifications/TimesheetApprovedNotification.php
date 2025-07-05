<?php

namespace Modules\TimesheetManagement\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

class TimesheetApprovedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     *
     * @return void
     */
    public function __construct()
    {
        // No additional parameters needed
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
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        $url = route('timesheets.weekly.show', $this->timesheet->id);

        return (new MailMessage)
            ->subject('Timesheet Approved')
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line('Your timesheet for the week of ' . $this->timesheet->week_start_date->format('M d, Y') . ' to ' . $this->timesheet->week_end_date->format('M d, Y') . ' has been approved.')
            ->line('Total Hours: ' . $this->timesheet->total_hours)
            ->line('Regular Hours: ' . $this->timesheet->regular_hours)
            ->line('Overtime Hours: ' . $this->timesheet->overtime_hours)
            ->action('View Timesheet', $url)
            ->line('Thank you for submitting your timesheet!');
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
            'week_start' => $this->timesheet->week_start_date->format('Y-m-d'),
            'week_end' => $this->timesheet->week_end_date->format('Y-m-d'),
            'total_hours' => $this->timesheet->total_hours,
            'approved_by' => $this->timesheet->approver?->name ?? 'System',
            'approved_at' => $this->timesheet->approved_at->format('Y-m-d H:i:s'),
            'status' => 'approved',
            'message' => 'Your timesheet for the week of ' . $this->timesheet->week_start_date->format('M d, Y') . ' to ' . $this->timesheet->week_end_date->format('M d, Y') . ' has been approved.',
            'url' => route('timesheets.weekly.show', $this->timesheet->id),
        ];
    }
}


