<?php

namespace Modules\EquipmentManagement\Actions;

use Modules\EquipmentManagement\Domain\Models\Equipment;
use Illuminate\Support\Facades\Log;
use Modules\RentalManagement\Services\ERPNextClient;

class SyncEquipmentFromERPNextAction
{
    public function execute(): int
    {
        $client = app(ERPNextClient::class);
        $erpItems = $client->fetchAllEquipmentItems();
        $count = 0;
        foreach ($erpItems as $erpItem) {
            $data = $this->mapToLocal($erpItem);
            // Always set erpnext_id from ERPNext 'name' field
            $data['erpnext_id'] = $erpItem['name'] ?? null;
            if (empty($data['erpnext_id'])) {
                continue;
            }
            Equipment::updateOrCreate(
                ['erpnext_id' => $data['erpnext_id']],
                $data
            );
            $count++;
        }
        Log::info("ERPNext Equipment Sync: {$count} equipment items processed.");
        return $count;
    }

    /**
     * Map ERPNext item fields to local equipment fields.
     */
    protected function mapToLocal(array $erpItem): array
    {
        return [
            'name' => $erpItem['item_name'] ?? $erpItem['name'] ?? null,
            'description' => $erpItem['description'] ?? null,
            'model_number' => $erpItem['model'] ?? null,
            'serial_number' => $erpItem['serial_no'] ?? null,
            'manufacturer' => $erpItem['manufacturer'] ?? null,
            'status' => 'available',
            'is_active' => ($erpItem['disabled'] ?? 0) == 0,
            // Add more mappings as needed
        ];
    }
}
