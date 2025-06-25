<?php

namespace Modules\RentalManagement\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Modules\RentalManagement\Models\Payment;

class PaymentProcessedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public readonly Payment $payment
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
            ->subject('Payment Processed Successfully')
            ->greeting("Hello {$notifiable->name},")
            ->line("Your payment of {$this->payment->amount} USD has been processed successfully.")
            ->line("Transaction ID: {$this->payment->transaction_id}")
            ->line("Payment Method: {$this->payment->payment_method}")
            ->line("Payment Date: {$this->payment->payment_date->format('F j, Y')}")
            ->action('View Booking Details', route('bookings.show', $this->payment->booking_id))
            ->line('Thank you for your payment!');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'payment_id' => $this->payment->id,
            'amount' => $this->payment->amount,
            'transaction_id' => $this->payment->transaction_id,
            'payment_method' => $this->payment->payment_method,
            'payment_date' => $this->payment->payment_date->format('Y-m-d H:i:s'),
            'booking_id' => $this->payment->booking_id,
            'type' => 'payment_processed',
        ];
    }
}