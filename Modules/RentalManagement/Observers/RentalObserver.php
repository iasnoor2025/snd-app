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
        \Log::info('RentalObserver updated fired', ['id' => $rental->id, 'status' => $rental->status, 'invoice_id' => $rental->invoice_id]);
        // Only act if status just changed to completed and invoice_id is not set
        if ($rental->isDirty('status') && $rental->status === 'completed' && !$rental->invoice_id) {
            \Log::info('RentalObserver: status changed to completed, starting ERPNext sync', ['rental_id' => $rental->id]);
            $customer = $rental->customer()->without('rentals')->first();
            if (!$customer) return;
            $erp = app(\Modules\RentalManagement\Services\ERPNextClient::class);
            \Log::info('RentalObserver: before ERPNext customer sync', ['customer_name' => $customer->name]);
            $erpCustomer = $erp->getOrCreateCustomer([
                'customer_name' => $customer->name,
                'customer_group' => 'Commercial',
                'territory' => 'All Territories',
            ]);
            \Log::info('RentalObserver: after ERPNext customer sync', ['erp_customer' => $erpCustomer]);
            // Build invoice payload
            $erpItems = [];
            foreach ($rental->rentalItems()->with('equipment')->get() as $item) {
                $equipment = $item->equipment;
                $itemCode = $equipment->item_code ?? $equipment->name;
                \Log::info('RentalObserver: before ERPNext item sync', ['item_code' => $itemCode]);
                $erpItem = null;
                try {
                    $erpItem = $erp->getOrCreateItem([
                        'item_code' => $itemCode,
                        'item_name' => $equipment->name,
                        'item_group' => 'Equipment',
                        'stock_uom' => 'Nos',
                        'description' => $equipment->description ?? $equipment->name,
                    ]);
                } catch (\Exception $e) {
                    \Log::error('ERPNext item sync failed: ' . $e->getMessage());
                }
                \Log::info('RentalObserver: after ERPNext item sync', ['erp_item' => $erpItem]);
                $erpItems[] = [
                    'item_code' => $itemCode,
                    'qty' => $item->quantity,
                    'rate' => $item->rate,
                ];
            }
            $payload = [
                'customer' => $erpCustomer['name'],
                'company' => 'Samhan Naser Al-Dosri Est',
                'currency' => 'SAR',
                'posting_date' => now()->toDateString(),
                'due_date' => $rental->payment_due_date?->toDateString() ?? now()->addDays(30)->toDateString(),
                'items' => $erpItems,
                'taxes' => [
                    [
                        'charge_type' => 'On Net Total',
                        'account_head' => 'VAT - SND',
                        'description' => 'VAT @ 15%',
                        'rate' => $rental->tax_percentage ?? 15
                    ]
                ],
            ];
            \Log::info('RentalObserver: before ERPNext invoice sync', ['payload' => $payload]);
            $invoice = $erp->createSalesInvoice($payload);
            \Log::info('RentalObserver: after ERPNext invoice sync', ['invoice' => $invoice]);
            if (!empty($invoice['name']) && $rental->invoice_id !== $invoice['name']) {
                // Use updateQuietly to avoid triggering the observer again
                $rental->updateQuietly(['invoice_id' => $invoice['name']]);
                \Log::info('RentalObserver: invoice_id updated', ['rental_id' => $rental->id, 'invoice_id' => $invoice['name']]);
            }
        }
        \Log::info('RentalObserver: updated() end', ['rental_id' => $rental->id]);
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
