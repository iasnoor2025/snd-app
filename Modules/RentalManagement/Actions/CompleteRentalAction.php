<?php

namespace Modules\RentalManagement\Actions;

use Modules\RentalManagement\Domain\Models\Rental;
use Illuminate\Support\Facades\DB;

class CompleteRentalAction
{
    public function execute(Rental $rental, int $userId): Rental
    {
        return DB::transaction(function () use ($rental, $userId) {
            return $rental->complete($userId);
        });
    }
}
