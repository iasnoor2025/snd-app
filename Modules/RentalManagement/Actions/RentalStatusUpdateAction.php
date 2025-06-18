<?php

namespace Modules\RentalManagement\Actions;

use Modules\RentalManagement\Domain\Entities\Rental;

class RentalStatusUpdateAction
{
    public function execute(Rental $rental, string $status, array $data = [])
    {
        $rental->update([
            'status' => $status,
            'updated_at' => now(),
        ]);

        // Log the status change
        activity()
            ->performedOn($rental)
            ->withProperties([
                'old_status' => $rental->getOriginal('status'),
                'new_status' => $status,
                'additional_data' => $data,
            ])
            ->log('Status updated');

        return $rental;
    }
}
