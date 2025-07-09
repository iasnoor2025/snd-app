<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Modules\RentalManagement\Domain\Models\Rental;
use Modules\RentalManagement\Services\ERPNextClient;
use Illuminate\Support\Facades\Log;

class SyncERPNextInvoiceStatus extends Command
{
    protected $signature = 'erpnext:sync-invoice-status';
    protected $description = 'Sync ERPNext invoice statuses and update rental status if needed';

    public function handle()
    {
        $client = app(ERPNextClient::class);
        $rentals = Rental::whereNotNull('invoice_id')->get();
        $updated = 0;
        foreach (
            $rentals as $rental) {
            try {
                $erpInvoice = $client->getInvoice($rental->invoice_id);
                $status = strtolower($erpInvoice['status'] ?? '');
                if (in_array($status, ['submitted', 'unpaid', 'unpaid and discounted', 'partly paid', 'partly paid and discounted'])) {
                    if ($rental->status !== 'payment_pending') {
                        $oldStatus = $rental->status;
                        $rental->update(['status' => 'payment_pending']);
                        Log::info('Rental status updated by scheduled sync', [
                            'rental_id' => $rental->id,
                            'old_status' => $oldStatus,
                            'new_status' => 'payment_pending',
                            'erp_invoice_status' => $status,
                        ]);
                        $updated++;
                    }
                } else if (in_array($status, ['overdue', 'overdue and discounted'])) {
                    if ($rental->status !== 'overdue') {
                        $oldStatus = $rental->status;
                        $rental->update(['status' => 'overdue']);
                        Log::info('Rental status updated by scheduled sync', [
                            'rental_id' => $rental->id,
                            'old_status' => $oldStatus,
                            'new_status' => 'overdue',
                            'erp_invoice_status' => $status,
                        ]);
                        $updated++;
                    }
                } else if ($status === 'paid') {
                    if ($rental->status !== 'closed') {
                        $oldStatus = $rental->status;
                        $rental->update(['status' => 'closed']);
                        Log::info('Rental status updated by scheduled sync', [
                            'rental_id' => $rental->id,
                            'old_status' => $oldStatus,
                            'new_status' => 'closed',
                            'erp_invoice_status' => $status,
                        ]);
                        $updated++;
                    }
                } else if (in_array($status, ['cancelled', 'amended', 'credit note issued'])) {
                    if ($rental->status !== 'cancelled') {
                        $oldStatus = $rental->status;
                        $rental->update(['status' => 'cancelled']);
                        Log::info('Rental status updated by scheduled sync (cancelled/amended)', [
                            'rental_id' => $rental->id,
                            'old_status' => $oldStatus,
                            'new_status' => 'cancelled',
                            'erp_invoice_status' => $status,
                        ]);
                        $updated++;
                    }
                    // Try to find a new amended invoice and update invoice_id
                    $newInvoice = $client->findInvoiceByAmendedFrom($rental->invoice_id);
                    if ($newInvoice) {
                        $rental->update(['invoice_id' => $newInvoice['name']]);
                        Log::info('Rental invoice_id updated to new amended invoice', [
                            'rental_id' => $rental->id,
                            'new_invoice_id' => $newInvoice['name'],
                        ]);
                        // Optionally, immediately sync status for the new invoice
                        $newStatus = strtolower($newInvoice['status'] ?? '');
                        // Recursively apply status logic for the new invoice
                        // (You may want to refactor this into a function for clarity)
                        if (in_array($newStatus, ['submitted', 'unpaid', 'unpaid and discounted', 'partly paid', 'partly paid and discounted'])) {
                            $rental->update(['status' => 'payment_pending']);
                        } else if (in_array($newStatus, ['overdue', 'overdue and discounted'])) {
                            $rental->update(['status' => 'overdue']);
                        } else if ($newStatus === 'paid') {
                            $rental->update(['status' => 'closed']);
                        }
                    }
                } else if ($status === 'return') {
                    if ($rental->status !== 'return') {
                        $oldStatus = $rental->status;
                        $rental->update(['status' => 'return']);
                        Log::info('Rental status updated by scheduled sync', [
                            'rental_id' => $rental->id,
                            'old_status' => $oldStatus,
                            'new_status' => 'return',
                            'erp_invoice_status' => $status,
                        ]);
                        $updated++;
                    }
                } else if ($status === 'internal transfer') {
                    if ($rental->status !== 'internal_transfer') {
                        $oldStatus = $rental->status;
                        $rental->update(['status' => 'internal_transfer']);
                        Log::info('Rental status updated by scheduled sync', [
                            'rental_id' => $rental->id,
                            'old_status' => $oldStatus,
                            'new_status' => 'internal_transfer',
                            'erp_invoice_status' => $status,
                        ]);
                        $updated++;
                    }
                }
            } catch (\Exception $e) {
                Log::error('Failed to sync ERPNext invoice for rental', [
                    'rental_id' => $rental->id,
                    'invoice_id' => $rental->invoice_id,
                    'error' => $e->getMessage(),
                ]);
            }
        }
        $this->info("Sync complete. Rentals updated: $updated");
        return 0;
    }
}
