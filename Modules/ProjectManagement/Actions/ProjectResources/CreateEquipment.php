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
                'equipment_id' => $data['equipment_id'],
                'start_date' => $data['start_date'],
                'end_date' => $data['end_date'],
                'usage_hours' => $data['usage_hours'],
                'hourly_rate' => $data['hourly_rate'],
                'maintenance_cost' => $data['maintenance_cost'] ?? 0,
                'total_cost' => $totalCost,
                'notes' => $data['notes'] ?? null,
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
