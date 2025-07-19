<?php

namespace Modules\EquipmentManagement\Actions;

use Modules\EquipmentManagement\Domain\Models\Equipment;
use Illuminate\Support\Facades\Log;
use Modules\RentalManagement\Services\ERPNextClient;

class SyncEquipmentFromERPNextAction
{
    public function execute(): int
    {
        try {
        $client = app(ERPNextClient::class);
        $erpItems = $client->fetchAllEquipmentItems();

            Log::info('ERPNext Equipment Sync: Starting sync', [
                'total_items' => count($erpItems)
            ]);

        $count = 0;
            $errors = [];

        foreach ($erpItems as $erpItem) {
                try {
            $data = $this->mapToLocal($erpItem);

            // Always set erpnext_id from ERPNext 'name' field
            $data['erpnext_id'] = $erpItem['name'] ?? null;

            if (empty($data['erpnext_id'])) {
                        Log::warning('ERPNext Equipment Sync: Skipping item without erpnext_id', [
                            'item' => $erpItem
                        ]);
                        continue;
                    }

                    // Validate required fields
                    if (empty($data['name'])) {
                        Log::warning('ERPNext Equipment Sync: Skipping item without name', [
                            'erpnext_id' => $data['erpnext_id'],
                            'item' => $erpItem
                        ]);
                continue;
            }

            Equipment::updateOrCreate(
                ['erpnext_id' => $data['erpnext_id']],
                $data
            );

            $count++;

                    Log::info('ERPNext Equipment Sync: Processed item', [
                        'erpnext_id' => $data['erpnext_id'],
                        'name' => $data['name']
                    ]);

                } catch (\Exception $e) {
                    $errors[] = [
                        'erpnext_id' => $erpItem['name'] ?? 'unknown',
                        'error' => $e->getMessage()
                    ];

                    Log::error('ERPNext Equipment Sync: Failed to process item', [
                        'erpnext_id' => $erpItem['name'] ?? 'unknown',
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                }
            }

            Log::info("ERPNext Equipment Sync: Completed", [
                'processed_count' => $count,
                'error_count' => count($errors),
                'errors' => $errors
            ]);

            return $count;

        } catch (\Exception $e) {
            Log::error('ERPNext Equipment Sync: Failed to execute sync', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            throw $e;
        }
    }

    /**
     * Map ERPNext item fields to local equipment fields.
     */
    protected function mapToLocal(array $erpItem): array
    {
        return [
            'name' => $erpItem['item_name'] ?? $erpItem['name'] ?? null,
            'description' => $erpItem['description'] ?? null,
            'model' => $erpItem['model'] ?? $erpItem['item_code'] ?? null,
            'serial_number' => $erpItem['serial_no'] ?? null,
            'manufacturer' => $erpItem['manufacturer'] ?? null,
            'status' => 'available',
            'is_active' => ($erpItem['disabled'] ?? 0) == 0,
            'daily_rate' => $this->parsePrice($erpItem['standard_rate'] ?? $erpItem['price_list_rate'] ?? 0),
            'purchase_cost' => $this->parsePrice($erpItem['last_purchase_rate'] ?? $erpItem['valuation_rate'] ?? 0),
            'purchase_price' => $this->parsePrice($erpItem['last_purchase_rate'] ?? $erpItem['valuation_rate'] ?? 0),
            'quantity' => $erpItem['stock_qty'] ?? 1,
            'unit' => $erpItem['stock_uom'] ?? 'Nos',
            'default_unit_cost' => $this->parsePrice($erpItem['standard_rate'] ?? 0),
            // Add more mappings as needed
        ];
    }

    /**
     * Parse price values from ERPNext, handling different formats
     */
    protected function parsePrice($value): float
    {
        if (is_numeric($value)) {
            return (float) $value;
        }

        if (is_string($value)) {
            // Remove currency symbols and commas
            $cleaned = preg_replace('/[^\d.-]/', '', $value);
            return is_numeric($cleaned) ? (float) $cleaned : 0.0;
        }

        return 0.0;
    }
}
