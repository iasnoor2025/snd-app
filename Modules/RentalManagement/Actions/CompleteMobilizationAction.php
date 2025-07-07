<?php

namespace Modules\RentalManagement\Actions;

use Modules\RentalManagement\Domain\Models\Rental;
use Illuminate\Support\Facades\DB;

class CompleteMobilizationAction
{
    public function execute(Rental $rental, int $userId): Rental
    {
        return DB::transaction(function () use ($rental) {
            $rental->update(['status' => 'mobilization_completed']);
            return $rental->refresh();
        });
    }
}
