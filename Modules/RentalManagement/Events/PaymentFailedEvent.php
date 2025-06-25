<?php

namespace Modules\RentalManagement\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Modules\RentalManagement\Models\Payment;

class PaymentFailedEvent
{
    use Dispatchable, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public readonly ?Payment $payment,
        public readonly ?string $errorMessage = null
    ) {}
} 