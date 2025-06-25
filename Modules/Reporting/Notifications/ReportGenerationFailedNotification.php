<?php

namespace Modules\Reporting\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ReportGenerationFailedNotification extends Notification
{
    use Queueable;

    protected string $type;
    protected string $error;

    /**
     * Create a new notification instance.
     */
    public function __construct(string $type, string $error)
    {
        $this->type = $type;
        $this->error = $error;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->error()
            ->subject("Report Generation Failed: {$this->type}")
            ->greeting('Hello!')
            ->line('We encountered an error while generating your requested report.')
            ->line('Report Details:')
            ->line("- Type: {$this->type}")
            ->line("- Error: {$this->error}")
            ->line("- Time: " . now()->format('Y-m-d H:i:s'))
            ->line('Our team has been notified and will investigate the issue.')
            ->line('Please try generating the report again later or contact support if the issue persists.')
            ->line('We apologize for any inconvenience caused.');
    }
} 