<?php

namespace Modules\RentalManagement\Actions;

use Modules\RentalManagement\Domain\Models\Rental;
use Illuminate\Support\Facades\DB;

class ApproveQuotationAction
{
    public function execute(Rental $rental, int $userId): Rental
    {
        return DB::transaction(function () use ($rental, $userId) {
            if (!$rental->quotation) {
                throw new \Exception('No quotation to approve.');
            }
            $rental->quotation->update(['status' => 'approved', 'approved_by' => $userId, 'approved_at' => now()]);
            $rental->update(['status' => 'quotation_approved', 'approved_by' => $userId, 'approved_at' => now()]);
            return $rental->refresh();
        });
    }
}
