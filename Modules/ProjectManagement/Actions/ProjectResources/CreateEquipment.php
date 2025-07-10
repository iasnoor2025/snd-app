<?php

namespace Modules\ProjectManagement\Actions\ProjectResources;

use Modules\ProjectManagement\Domain\Models\Project;
use Modules\ProjectManagement\Domain\Models\ProjectEquipment;
use Illuminate\Support\Facades\Log;

class CreateEquipment
{
    /**
     * Execute the action to create a new equipment resource.
     *
     * @param Project $project The project to add equipment to
     * @param array $data The validated data for creating the equipment resource
     * @return ProjectEquipment The created equipment resource
     */
    public function execute(Project $project, array $data): ProjectEquipment
    {
        try {
            // Calculate total cost
            $totalCost = ($data['usage_hours'] * $data['hourly_rate']) + ($data['maintenance_cost'] ?? 0);

            // Create the equipment resource
            $equipment = $project->equipment()->create([
                'project_id' => $project->id,
                'equipment_id' => $data['equipment_id'],
                'start_date' => $data['start_date'],
                'end_date' => $data['end_date'],
                'usage_hours' => $data['usage_hours'],
                'hourly_rate' => $data['hourly_rate'],
                'maintenance_cost' => $data['maintenance_cost'] ?? 0,
                'total_cost' => $totalCost,
                'notes' => $data['notes'] ?? '',
                'date_used' => $data['start_date'],
                'name' => !empty($data['name']) ? $data['name'] : 'Equipment',
                'unit' => 'hours',
                'quantity' => $data['usage_hours'] ?? 0,
                'unit_price' => $data['hourly_rate'] ?? 0,
                'type' => 'equipment',
                'category' => 'equipment',
                'amount' => $totalCost,
                'description' => $data['description'] ?? '',
                'equipment_cost' => $totalCost,
                'unit_cost' => $data['hourly_rate'] ?? 0,
                'status' => 'active',
                'worker_name' => $data['operator_name'] ?? '',
            ]);

            Log::info('Equipment resource created successfully', [
                'project_id' => $project->id,
                'equipment_id' => $equipment->id,
                'equipment_type_id' => $equipment->equipment_id,
            ]);

            return $equipment;
        } catch (\Exception $e) {
            Log::error('Failed to create equipment resource', [
                'project_id' => $project->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }
}
