<?php

namespace Modules\RentalManagement\Actions;

use Modules\RentalManagement\Domain\Models\Rental;
use Modules\RentalManagement\Domain\Models\Quotation;
use Illuminate\Support\Facades\DB;

class GenerateQuotationAction
{
    /**
     * Execute the action to generate a quotation from a rental.
     *
     * @param Rental $rental
     * @return Quotation
     */
    public function execute(Rental $rental): Quotation
    {
        return DB::transaction(function () use ($rental) {
            // Create a new Quotation from the rental
            $quotation = new Quotation();
            $quotation->rental_id = $rental->id;
            $quotation->customer_id = $rental->customer_id;
            $quotation->quotation_number = Quotation::generateQuotationNumber();
            $quotation->status = 'pending';
            $quotation->total_amount = $rental->total_amount;
            $quotation->notes = "Quotation generated from rental {$rental->rental_number}";
            $quotation->save();

            // Copy rental items to quotation items
            foreach ($rental->rentalItems as $rentalItem) {
                $quotation->quotationItems()->create([
                    'equipment_id' => $rentalItem->equipment_id,
                    'operator_id' => $rentalItem->operator_id,
                    'description' => $rentalItem->notes,
                    'quantity' => $rentalItem->quantity ?? 1,
                    'rate' => $rentalItem->unit_price,
                    'rate_type' => $rentalItem->rate_type ?? $rentalItem->rental_rate_period,
                    'total_amount' => $rentalItem->total_amount,
                ]);
            }

            return $quotation;
        });
    }
}
