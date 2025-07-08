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
            // Always create a new quotation: delete the old one if it exists
            $existing = Quotation::where('rental_id', $rental->id)->first();
            if ($existing) {
                // Optionally, delete related quotation items as well
                $existing->quotationItems()->delete();
                $existing->delete();
            }

            // Calculate subtotal, tax, and total
            $subtotal = $rental->rentalItems->sum(function ($item) {
                $amount = $item->total_amount ?? $item->total ?? 0;
                return is_numeric($amount) ? (float)$amount : 0;
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
            $quotation->status = 'draft';
            $quotation->total_amount = $total;
            $quotation->subtotal = $subtotal;
            $quotation->tax_percentage = $taxPercentage;
            $quotation->tax_amount = $taxAmount;
            $quotation->discount_percentage = $discountPercentage;
            $quotation->discount_amount = $discountAmount;
            $quotation->issue_date = now();
            $quotation->valid_until = now()->addDays(30);
            $quotation->notes = "Quotation generated from rental {$rental->rental_number}";
            $quotation->created_by = auth()->id() ?? 1;
            $quotation->save();

            // Copy rental items to quotation items
            foreach ($rental->rentalItems as $rentalItem) {
                if (empty($rentalItem->equipment_id)) continue; // skip items with no equipment
                $quantity = $rentalItem->quantity ?? 1;
                $unitPrice = is_numeric($rentalItem->unit_price) ? (float)$rentalItem->unit_price : 0;
                $totalAmount = $rentalItem->total_amount ?? $rentalItem->total ?? ($unitPrice * $quantity);
                $rateType = $rentalItem->rate_type ?? $rentalItem->rental_rate_period ?? 'daily';
                // Always set name, fallback to equipment_id if needed
                $equipmentName = '';
                if (isset($rentalItem->equipment)) {
                    if (is_array($rentalItem->equipment)) {
                        $equipmentName = $rentalItem->equipment['name'] ?? '';
                    } elseif (is_object($rentalItem->equipment)) {
                        $equipmentName = $rentalItem->equipment->name ?? '';
                    }
                }
                if (!$equipmentName && isset($rentalItem->equipment_name)) {
                    $equipmentName = $rentalItem->equipment_name;
                }
                if (!$equipmentName) {
                    $equipmentName = 'Equipment #' . ($rentalItem->equipment_id ?? '');
                }
                $quotation->quotationItems()->create([
                    'name' => $equipmentName,
                    'equipment_id' => $rentalItem->equipment_id,
                    'operator_id' => $rentalItem->operator_id ?? null,
                    'description' => $rentalItem->notes ?? '',
                    'quantity' => $quantity,
                    'rate' => $unitPrice,
                    'rate_type' => $rateType,
                    'total_amount' => is_numeric($totalAmount) ? (float)$totalAmount : 0,
                ]);
            }

            // Set the rental's quotation_id to the new quotation
            $rental->quotation_id = $quotation->id;
            $rental->save();

            // Update rental status to 'quotation' and log status change
                $oldStatus = $rental->status;
                $rental->update(['status' => 'quotation']);
                $rental->statusLogs()->create([
                    'from_status' => $oldStatus,
                    'to_status' => 'quotation',
                    'changed_by' => auth()->id() ?? null,
                    'notes' => 'Quotation generated from rental.'
                ]);

            return $quotation;
        });
    }
}
