<?php

namespace Modules\RentalManagement\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\DatabaseMessage;
use Modules\RentalManagement\Domain\Models\Rental;

class AutomatedFollowUpNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $rental;

    public function __construct(Rental $rental)
    {
        $this->rental = $rental;
    }

    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Thank you for your recent rental!')
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line('We hope your experience with your recent rental (Rental #' . $this->rental->rental_number . ') was excellent.')
            ->line('If you have any feedback or need further assistance, please let us know.')
            ->action('Leave Feedback', url('/customer/feedback/' . $this->rental->id))
            ->line('Thank you for choosing us!');
    }

    public function toDatabase($notifiable)
    {
        return [
            'rental_id' => $this->rental->id,
            'rental_number' => $this->rental->rental_number,
            'message' => 'Thank you for your recent rental! Please leave your feedback.',
            'action_url' => url('/customer/feedback/' . $this->rental->id),
        ];
    }

    public function toArray($notifiable)
    {
        return [
            'rental_id' => $this->rental->id,
            'rental_number' => $this->rental->rental_number,
            'message' => 'Thank you for your recent rental! Please leave your feedback.',
            'action_url' => url('/customer/feedback/' . $this->rental->id),
        ];
    }
}
