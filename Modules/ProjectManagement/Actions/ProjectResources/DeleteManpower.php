<?php

namespace Modules\ProjectManagement\Actions\ProjectResources;

use Modules\ProjectManagement\Domain\Models\ProjectManpower;
use Illuminate\Support\Facades\Log;

class DeleteManpower
{
    /**
     * Execute the action to delete a manpower resource.
     *
     * @param ProjectManpower $manpower The manpower resource to delete
     * @return bool Whether the deletion was successful
     */
    public function execute(ProjectManpower $manpower): bool
    {
        try {
            $manpowerId = $manpower->id;
            $projectId = $manpower->project_id;
            $employeeId = $manpower->employee_id;
            $workerName = $manpower->worker_name;

            // Delete the manpower resource
            $result = $manpower->delete();

            Log::info('Manpower resource deleted successfully', [
                'manpower_id' => $manpowerId,
                'project_id' => $projectId,
                'employee_id' => $employeeId,
                'worker_name' => $workerName,
            ]);

            return $result;
        } catch (\Exception $e) {
            Log::error('Failed to delete manpower resource', [
                'manpower_id' => $manpower->id,
                'project_id' => $manpower->project_id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }
}
