<?php

namespace Modules\ProjectManagement\Actions\ProjectResources;

use Modules\ProjectManagement\Domain\Models\ProjectEquipment;
use Illuminate\Support\Facades\Log;

class DeleteEquipment
{
    /**
     * Execute the action to delete an equipment resource.
     *
     * @param ProjectEquipment $equipment The equipment resource to delete
     * @return bool Whether the deletion was successful
     */
    public function execute(ProjectEquipment $equipment): bool
    {
        try {
            $equipmentId = $equipment->id;
            $projectId = $equipment->project_id;
            $equipmentTypeId = $equipment->equipment_id;

            // Delete the equipment resource
            $result = $equipment->delete();

            Log::info('Equipment resource deleted successfully', [
                'equipment_id' => $equipmentId,
                'project_id' => $projectId,
                'equipment_type_id' => $equipmentTypeId,
            ]);

            return $result;
        } catch (\Exception $e) {
            Log::error('Failed to delete equipment resource', [
                'equipment_id' => $equipment->id,
                'project_id' => $equipment->project_id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }
}
