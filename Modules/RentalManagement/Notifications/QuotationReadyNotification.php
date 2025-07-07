<?php

namespace Modules\RentalManagement\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Modules\RentalManagement\Domain\Models\Quotation;

class QuotationReadyNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $quotation;

    public function __construct(Quotation $quotation)
    {
        $this->quotation = $quotation;
    }

    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Your Rental Quotation is Ready')
            ->greeting('Hello!')
            ->line('Your rental quotation is now ready.')
            ->action('View Quotation', url('/quotations/' . $this->quotation->id))
            ->line('Thank you for using our service!');
    }

    public function toArray($notifiable)
    {
        return [
            'quotation_id' => $this->quotation->id,
            'quotation_number' => $this->quotation->quotation_number,
            'message' => 'Your rental quotation is ready.',
        ];
    }
}
