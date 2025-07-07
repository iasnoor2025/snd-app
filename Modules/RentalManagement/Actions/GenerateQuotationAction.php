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
            // Prevent duplicate quotations for the same rental
            $existing = Quotation::where('rental_id', $rental->id)->first();
            if ($existing) {
                return $existing;
            }

            // Calculate subtotal, tax, and total
            $subtotal = $rental->rentalItems->sum(function ($item) {
                return $item->total_amount;
            });
            $taxPercentage = $rental->tax_percentage ?? 0.15;
            $taxAmount = $subtotal * $taxPercentage;
            $discountPercentage = $rental->discount_percentage ?? 0;
            $discountAmount = $subtotal * ($discountPercentage / 100);
            $total = $subtotal + $taxAmount - $discountAmount;

            // Create a new Quotation from the rental
            $quotation = new Quotation();
            $quotation->rental_id = $rental->id;
            $quotation->customer_id = $rental->customer_id;
            $quotation->quotation_number = Quotation::generateQuotationNumber();
            $quotation->status = 'pending';
            $quotation->total_amount = $total;
            $quotation->subtotal = $subtotal;
            $quotation->tax_percentage = $taxPercentage;
            $quotation->tax_amount = $taxAmount;
            $quotation->discount_percentage = $discountPercentage;
            $quotation->discount_amount = $discountAmount;
            $quotation->issue_date = now();
            $quotation->valid_until = now()->addDays(30);
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

            // Update rental status to 'quotation' and log status change
            if ($rental->status !== 'quotation') {
                $oldStatus = $rental->status;
                $rental->update(['status' => 'quotation']);
                $rental->statusLogs()->create([
                    'from_status' => $oldStatus,
                    'to_status' => 'quotation',
                    'changed_by' => auth()->id() ?? null,
                    'notes' => 'Quotation generated from rental.'
                ]);
            }

            return $quotation;
        });
    }
}
