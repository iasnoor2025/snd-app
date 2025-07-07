<?php

namespace Modules\RentalManagement\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Modules\RentalManagement\Domain\Models\Rental;

class RentalApproved
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $rental;

    public function __construct(Rental $rental)
    {
        $this->rental = $rental;
    }
}
