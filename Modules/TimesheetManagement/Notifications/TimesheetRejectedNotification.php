<?php

namespace Modules\TimesheetManagement\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

class TimesheetRejectedNotification extends Notification implements ShouldQueue
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
        $url = route('timesheets.weekly.edit', $this->timesheet->id);

        $mail = (new MailMessage)
            ->subject('Timesheet Rejected')
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line('Your timesheet for the week of ' . $this->timesheet->week_start_date->format('M d, Y') . ' to ' . $this->timesheet->week_end_date->format('M d, Y') . ' has been rejected.')
            ->line('Total Hours: ' . $this->timesheet->total_hours);

        // Add rejection reason if available
        if ($this->timesheet->rejection_reason) {
            $mail->line('Reason for rejection: ' . $this->timesheet->rejection_reason);
        }

        return $mail->action('Edit Timesheet', $url)
            ->line('Please update your timesheet and resubmit it.');
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
            'rejected_by' => $this->timesheet->rejector?->name ?? 'System',
            'rejected_at' => $this->timesheet->rejected_at->format('Y-m-d H:i:s'),
            'status' => 'rejected',
            'rejection_reason' => $this->timesheet->rejection_reason,
            'message' => 'Your timesheet for the week of ' . $this->timesheet->week_start_date->format('M d, Y') . ' to ' . $this->timesheet->week_end_date->format('M d, Y') . ' has been rejected.',
            'url' => route('timesheets.weekly.edit', $this->timesheet->id),
        ];
    }
}


