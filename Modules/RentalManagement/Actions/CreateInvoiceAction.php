<?php

namespace Modules\RentalManagement\Actions;

use Modules\RentalManagement\Domain\Models\Rental;
use Illuminate\Support\Facades\DB;

class CreateInvoiceAction
{
    public function execute(Rental $rental)
    {
        return DB::transaction(function () use ($rental) {
            return $rental->createInvoice();
        });
    }
}
