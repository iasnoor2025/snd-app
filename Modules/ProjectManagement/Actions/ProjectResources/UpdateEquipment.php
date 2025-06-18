<?php

namespace Modules\ProjectManagement\Actions\ProjectResources;

use Modules\ProjectManagement\Domain\Models\ProjectEquipment;
use Illuminate\Support\Facades\Log;

class UpdateEquipment
{
    /**
     * Execute the action to update an existing equipment resource.
     *
     * @param ProjectEquipment $equipment The equipment resource to update
     * @param array $data The validated data for updating the equipment resource
     * @return ProjectEquipment The updated equipment resource
     */
    public function execute(ProjectEquipment $equipment, array $data): ProjectEquipment
    {
        try {
            // Calculate total cost
            $totalCost = ($data['usage_hours'] * $data['hourly_rate']) + ($data['maintenance_cost'] ?? 0);

            // Update the equipment resource
            $equipment->update([
                'equipment_id' => $data['equipment_id'],
                'start_date' => $data['start_date'],
                'end_date' => $data['end_date'],
                'usage_hours' => $data['usage_hours'],
                'hourly_rate' => $data['hourly_rate'],
                'maintenance_cost' => $data['maintenance_cost'] ?? 0,
                'total_cost' => $totalCost,
                'notes' => $data['notes'] ?? null,
            ]);

            Log::info('Equipment resource updated successfully', [
                'equipment_id' => $equipment->id,
                'project_id' => $equipment->project_id,
                'equipment_type_id' => $equipment->equipment_id,
            ]);

            return $equipment;
        } catch (\Exception $e) {
            Log::error('Failed to update equipment resource', [
                'equipment_id' => $equipment->id,
                'project_id' => $equipment->project_id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }
}
