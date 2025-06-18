<?php

namespace Modules\LeaveManagement\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Modules\LeaveManagement\Domain\Models\Leave;

class NewLeaveRequestNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * The leave instance.
     *
     * @var \Modules\LeaveManagement\Domain\Models\Leave
     */
    protected $leave;

    /**
     * Create a new notification instance.
     *
     * @param  \Modules\LeaveManagement\Domain\Models\Leave  $leave
     * @return void
     */
    public function __construct(Leave $leave)
    {
        $this->leave = $leave;
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
        return (new MailMessage)
            ->subject('New Leave Request - ' . $this->leave->employee->full_name)
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line('A new leave request has been submitted and requires your attention.')
            ->line('**Employee:** ' . $this->leave->employee->full_name)
            ->line('**Leave Type:** ' . $this->leave->leaveType->name)
            ->line('**Duration:** ' . $this->leave->start_date->format('M d, Y') . ' to ' . $this->leave->end_date->format('M d, Y'))
            ->line('**Days:** ' . $this->leave->days_count . ' day(s)')
            ->line('**Reason:** ' . $this->leave->reason)
            ->action('Review Leave Request', url('/leaves/approvals'))
            ->line('Please review and take appropriate action on this leave request.');
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
            'leave_id' => $this->leave->id,
            'employee_name' => $this->leave->employee->full_name,
            'leave_type' => $this->leave->leaveType->name,
            'start_date' => $this->leave->start_date->format('Y-m-d'),
            'end_date' => $this->leave->end_date->format('Y-m-d'),
            'days_count' => $this->leave->days_count,
            'reason' => $this->leave->reason,
            'message' => 'New leave request from ' . $this->leave->employee->full_name,
        ];
    }
}
