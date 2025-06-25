<?php

namespace Modules\Reporting\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Storage;

class ReportGeneratedNotification extends Notification
{
    use Queueable;

    protected string $type;
    protected string $path;
    protected int $size;
    protected array $options;

    /**
     * Create a new notification instance.
     */
    public function __construct(string $type, string $path, int $size, array $options)
    {
        $this->type = $type;
        $this->path = $path;
        $this->size = $size;
        $this->options = $options;
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
        $downloadUrl = Storage::temporaryUrl(
            $this->path,
            now()->addHours(24),
            ['Content-Type' => 'application/pdf']
        );

        return (new MailMessage)
            ->subject("Your {$this->type} Report is Ready")
            ->greeting('Hello!')
            ->line('Your requested report has been generated successfully.')
            ->line('Report Details:')
            ->line("- Type: {$this->type}")
            ->line("- Size: " . $this->formatSize($this->size))
            ->line("- Generated At: " . now()->format('Y-m-d H:i:s'))
            ->action('Download Report', $downloadUrl)
            ->line('This download link will expire in 24 hours.')
            ->line('Thank you for using our application!');
    }

    /**
     * Format file size for human readability
     */
    protected function formatSize(int $size): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $power = $size > 0 ? floor(log($size, 1024)) : 0;
        
        return number_format($size / (1024 ** $power), 2) . ' ' . $units[$power];
    }
} 