<?php

namespace Modules\EquipmentManagement\Actions;

use Modules\EquipmentManagement\Domain\Models\Equipment;

class CreateEquipmentAction
{
    /**
     * Execute the action to create new equipment.
     *
     * @param  array  $data
     * @return \Modules\EquipmentManagement\Domain\Models\Equipment;
     */
    public function execute(array $data): Equipment
    {
        // Validate the data or assume it's already validated

        // Create the equipment
        return Equipment::create([
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'category_id' => $data['category_id'] ?? null,
            'manufacturer' => $data['manufacturer'] ?? null,
            'model_number' => $data['model_number'] ?? null,
            'serial_number' => $data['serial_number'] ?? null,
            'purchase_date' => $data['purchase_date'] ?? null,
            'purchase_price' => $data['purchase_price'] ?? null,
            'warranty_expiry_date' => $data['warranty_expiry_date'] ?? null,
            'status' => $data['status'] ?? 'available',
            'location_id' => $data['location_id'] ?? null,
            'assigned_to' => $data['assigned_to'] ?? null,
            'last_maintenance_date' => $data['last_maintenance_date'] ?? null,
            'next_maintenance_date' => $data['next_maintenance_date'] ?? null,
            'notes' => $data['notes'] ?? null
        ]);
    }
}

