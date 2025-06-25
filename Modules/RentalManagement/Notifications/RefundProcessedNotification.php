<?php

namespace Modules\RentalManagement\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Modules\RentalManagement\Models\Refund;

class RefundProcessedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public readonly Refund $refund
    ) {}

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Refund Processed Successfully')
            ->greeting("Hello {$notifiable->name},")
            ->line("Your refund of {$this->refund->amount} USD has been processed successfully.")
            ->line("Transaction ID: {$this->refund->transaction_id}")
            ->line("Refund Reason: {$this->refund->reason}")
            ->line("Refund Date: {$this->refund->refund_date->format('F j, Y')}")
            ->action('View Booking Details', route('bookings.show', $this->refund->booking_id))
            ->line('If you have any questions, please contact our support team.');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'refund_id' => $this->refund->id,
            'amount' => $this->refund->amount,
            'transaction_id' => $this->refund->transaction_id,
            'reason' => $this->refund->reason,
            'refund_date' => $this->refund->refund_date->format('Y-m-d H:i:s'),
            'booking_id' => $this->refund->booking_id,
            'payment_id' => $this->refund->payment_id,
            'type' => 'refund_processed',
        ];
    }
} 