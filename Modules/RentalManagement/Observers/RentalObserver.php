<?php

namespace Modules\RentalManagement\Observers;

use Modules\RentalManagement\Domain\Models\Rental;

class RentalObserver
{
    /**
     * Handle the Rental "created" event.
     */
    public function created(Rental $rental): void
    {
        // Calculate totals when a rental is created
        $this->calculateTotals($rental);
    }

    /**
     * Handle the Rental "updated" event.
     */
    public function updated(Rental $rental): void
    {
        // Recalculate totals when a rental is updated
        $this->calculateTotals($rental);
    }

    /**
     * Calculate rental totals
     */
    private function calculateTotals(Rental $rental): void
    {
        // If there are no items, use the total_amount from the rental record
        $subtotal = $rental->items ? $rental->items->sum('total_amount') : ($rental->total_amount ?? 0);
        $taxAmount = ($subtotal * ($rental->tax_percentage ?? 0)) / 100;
        $discountAmount = ($subtotal * ($rental->discount_percentage ?? 0)) / 100;
        $totalAmount = $subtotal + $taxAmount - $discountAmount;

        $rental->update([
            'subtotal' => $subtotal,
            'tax_amount' => $taxAmount,
            'total_amount' => $totalAmount,
        ]);
    }
} 