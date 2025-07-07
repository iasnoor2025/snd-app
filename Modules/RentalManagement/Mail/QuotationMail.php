<?php

namespace Modules\RentalManagement\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Modules\RentalManagement\Domain\Models\Quotation;

class QuotationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $quotation;

    /**
     * Create a new message instance.
     */
    public function __construct(Quotation $quotation)
    {
        $this->quotation = $quotation;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject('Your Rental Quotation')
            ->markdown('RentalManagement::emails.quotation', [
                'quotation' => $this->quotation,
            ]);
    }
}
