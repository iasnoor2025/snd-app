<?php

namespace Modules\RentalManagement\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Modules\RentalManagement\Domain\Models\Invoice;

class InvoiceGenerated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $invoice;

    public function __construct(Invoice $invoice)
    {
        $this->invoice = $invoice;
    }
}
