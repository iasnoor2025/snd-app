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
                if (in_array($status, ['submitted', 'unpaid']) && $rental->status !== 'payment_pending') {
                    $oldStatus = $rental->status;
                    $rental->update(['status' => 'payment_pending']);
                    Log::info('Rental status updated by scheduled sync', [
                        'rental_id' => $rental->id,
                        'old_status' => $oldStatus,
                        'new_status' => 'payment_pending',
                        'erp_invoice_status' => $status,
                    ]);
                    $updated++;
                } else if ($status === 'overdue' && $rental->status !== 'overdue') {
                    $oldStatus = $rental->status;
                    $rental->update(['status' => 'overdue']);
                    Log::info('Rental status updated by scheduled sync', [
                        'rental_id' => $rental->id,
                        'old_status' => $oldStatus,
                        'new_status' => 'overdue',
                        'erp_invoice_status' => $status,
                    ]);
                    $updated++;
                } else if ($status === 'paid' && $rental->status !== 'closed') {
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
