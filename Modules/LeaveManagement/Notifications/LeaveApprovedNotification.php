<?php

namespace Modules\LeaveManagement\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Modules\LeaveManagement\Domain\Models\Leave;

class LeaveApprovedNotification extends Notification implements ShouldQueue
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
            ->subject('Leave Request Approved')
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line('Great news! Your leave request has been approved.')
            ->line('**Leave Type:** ' . $this->leave->leaveType->name)
            ->line('**Duration:** ' . $this->leave->start_date->format('M d, Y') . ' to ' . $this->leave->end_date->format('M d, Y'))
            ->line('**Days:** ' . $this->leave->days_count . ' day(s)')
            ->line('**Approved by:** ' . ($this->leave->approved_by ? $this->leave->approvedBy->name : 'System'))
            ->line('**Approval Date:** ' . $this->leave->approved_at->format('M d, Y'))
            ->action('View Leave Details', url('/leaves/requests'))
            ->line('Enjoy your time off!');
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
            'leave_type' => $this->leave->leaveType->name,
            'start_date' => $this->leave->start_date->format('Y-m-d'),
            'end_date' => $this->leave->end_date->format('Y-m-d'),
            'days_count' => $this->leave->days_count,
            'approved_by' => $this->leave->approved_by ? $this->leave->approvedBy->name : 'System',
            'approved_at' => $this->leave->approved_at->format('Y-m-d H:i:s'),
            'message' => 'Your leave request has been approved',
        ];
    }
}
