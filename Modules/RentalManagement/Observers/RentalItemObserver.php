<?php

namespace Modules\RentalManagement\Observers;

use Modules\RentalManagement\Domain\Models\RentalItem;

class RentalItemObserver
{
    /**
     * Handle the RentalItem "created" event.
     */
    public function created(RentalItem $rentalItem): void
    {
        $this->calculateTotal($rentalItem);
    }

    /**
     * Handle the RentalItem "updated" event.
     */
    public function updated(RentalItem $rentalItem): void
    {
        $this->calculateTotal($rentalItem);
    }

    /**
     * Calculate rental item total
     */
    private function calculateTotal(RentalItem $rentalItem): void
    {
        $total = $rentalItem->unit_price * $rentalItem->quantity * $rentalItem->days;
        $discountAmount = ($total * $rentalItem->discount_percentage) / 100;
        $finalTotal = $total - $discountAmount;

        $rentalItem->update([
            'total_amount' => $finalTotal,
        ]);

        // Update parent rental totals
        if ($rentalItem->rental) {
            $rentalItem->rental->touch();
        }
    }
} 