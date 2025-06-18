<?php

namespace Modules\Notifications\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\DatabaseMessage;
use Modules\LeaveManagement\Domain\Models\LeaveRequest;

class LeaveRequestNotification extends Notification implements ShouldQueue
{
    use Queueable;
use /**
     * The leave request instance.
     *
     * @var \Modules\LeaveManagement\Domain\Models\LeaveRequest
     */
    protected $leaveRequest;

    /**
     * The action type.
     *
     * @var string
     */
    protected $action;

    /**
     * Custom message.
     *
     * @var string|null
     */
    protected $customMessage;

    /**
     * Create a new notification instance.
     *
     * @param \Modules\LeaveManagement\Domain\Models\LeaveRequest $leaveRequest
     * @param string $action
     * @param string|null $customMessage
     * @return void;
     */
    public function __construct(LeaveRequest $leaveRequest, string $action, ?string $customMessage = null)
    {
        $this->leaveRequest = $leaveRequest;
        $this->action = $action;
        $this->customMessage = $customMessage;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param mixed $notifiable
     * @return array;
     */
    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     *
     * @param mixed $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage;
     */
    public function toMail($notifiable)
    {
        $employee = $this->leaveRequest->employee;
        $leaveType = $this->leaveRequest->leaveType;

        $mail = (new MailMessage)
            ->subject($this->getSubject())
            ->greeting('Hello ' . $notifiable->name . '!');

        if ($this->customMessage) {
            $mail->line($this->customMessage);
        }

        $mail->line('Leave Request Details:')
            ->line('Employee: ' . ($employee ? $employee->name : 'Unknown'))
            ->line('Leave Type: ' . ($leaveType ? $leaveType->name : 'Unknown'))
            ->line('Start Date: ' . $this->leaveRequest->start_date->format('Y-m-d'))
            ->line('End Date: ' . $this->leaveRequest->end_date->format('Y-m-d'))
            ->line('Status: ' . ucfirst($this->leaveRequest->status))
            ->line('Reason: ' . $this->leaveRequest->reason);

        if ($this->action === 'created' && $notifiable->id !== $employee->id) {
            $mail->action('Review Leave Request', url('/leave-requests/' . $this->leaveRequest->id));
        }

        $mail->line('Thank you for using our application!');

        return $mail;
    }

    /**
     * Get the database representation of the notification.
     *
     * @param mixed $notifiable
     * @return array;
     */
    public function toDatabase($notifiable)
    {
        $employee = $this->leaveRequest->employee;

        return [
            'leave_request_id' => $this->leaveRequest->id,
            'employee_id' => $employee ? $employee->id : null,
            'employee_name' => $employee ? $employee->name : 'Unknown',
            'start_date' => $this->leaveRequest->start_date->format('Y-m-d'),
            'end_date' => $this->leaveRequest->end_date->format('Y-m-d'),
            'status' => $this->leaveRequest->status,
            'action' => $this->action,
            'message' => $this->getMessage(),
            'url' => '/leave-requests/' . $this->leaveRequest->id,
        ];
    }

    /**
     * Get the array representation of the notification.
     *
     * @param mixed $notifiable
     * @return array;
     */
    public function toArray($notifiable)
    {
        return $this->toDatabase($notifiable);
    }

    /**
     * Get the notification message based on the action.
     *
     * @return string;
     */
    protected function getMessage()
    {
        if ($this->customMessage) {
            return $this->customMessage;
        }

        $employee = $this->leaveRequest->employee;
        $employeeName = $employee ? $employee->name : 'An employee';

        switch ($this->action) {
            case 'created':
                return "{$employeeName} has submitted a new leave request.";
            case 'status_changed':
                return "Leave request has been " . ucfirst($this->leaveRequest->status) . ".";
            case 'deleted':
                return "Leave request has been deleted.";
            default:
                return "There has been an update to a leave request.";
        }
    }

    /**
     * Get the notification subject based on the action.
     *
     * @return string;
     */
    protected function getSubject()
    {
        $employee = $this->leaveRequest->employee;
        $employeeName = $employee ? $employee->name : 'An employee';

        switch ($this->action) {
            case 'created':
                return "New Leave Request from {$employeeName}";
            case 'status_changed':
                return "Leave Request Status Updated: " . ucfirst($this->leaveRequest->status);
            case 'deleted':
                return "Leave Request Deleted";
            default:
                return "Leave Request Update";
        }
    }
}


