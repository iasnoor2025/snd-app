<?php

namespace Modules\RentalManagement\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Modules\RentalManagement\Models\Refund;

class RefundProcessedEvent
{
    use Dispatchable, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public readonly Refund $refund
    ) {}
} 