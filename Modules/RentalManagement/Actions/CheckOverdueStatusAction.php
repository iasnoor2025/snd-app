<?php

namespace Modules\RentalManagement\Actions;

use Modules\RentalManagement\Domain\Rental;
use Modules\RentalManagement\Domain\RentalStatus;
use Carbon\Carbon;

class CheckOverdueStatusAction
{
    /**
     * Check if a rental is overdue and update its status if necessary.
     */
    public function execute(Rental $rental): Rental
    {
        // Only check active rentals
        if (!in_array($rental->status, [RentalStatus::ACTIVE, RentalStatus::STARTED])) {
            return $rental;
        }

        // Check if the rental is past its end date
        if ($rental->end_date && Carbon::parse($rental->end_date)->isPast()) {
            // Update status to overdue if not already
            if ($rental->status !== RentalStatus::OVERDUE) {
                $rental->update([
                    'status' => RentalStatus::OVERDUE->value,
                    'overdue_date' => Carbon::now(),
                ]);
            }
        }

        return $rental->fresh();
    }

    /**
     * Check overdue status for multiple rentals.
     */
    public function executeForMultiple($rentals): array
    {
        $updated = [];

        foreach ($rentals as $rental) {
            $updatedRental = $this->execute($rental);
            if ($updatedRental->status === RentalStatus::OVERDUE) {
                $updated[] = $updatedRental;
            }
        }

        return $updated;
    }
}
