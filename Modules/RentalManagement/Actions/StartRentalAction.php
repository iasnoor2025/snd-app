<?php

namespace Modules\RentalManagement\Actions;

use Modules\RentalManagement\Domain\Models\Rental;
use Illuminate\Support\Facades\DB;

class StartRentalAction
{
    public function execute(Rental $rental, int $userId): Rental
    {
        return DB::transaction(function () use ($rental, $userId) {
            $rental = $rental->activate();
            // Optionally generate timesheets if needed
            if ($rental->has_timesheet) {
                $rental->generateTimesheets();
            }
            return $rental;
        });
    }
}
