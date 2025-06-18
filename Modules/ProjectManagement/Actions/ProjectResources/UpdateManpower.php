<?php

namespace Modules\ProjectManagement\Actions\ProjectResources;

use Modules\ProjectManagement\Domain\Models\ProjectManpower;
use Illuminate\Support\Facades\Log;

class UpdateManpower
{
    /**
     * Execute the action to update an existing manpower resource.
     *
     * @param ProjectManpower $manpower The manpower resource to update
     * @param array $data The validated data for updating the manpower resource
     * @return ProjectManpower The updated manpower resource
     */
    public function execute(ProjectManpower $manpower, array $data): ProjectManpower
    {
        try {
            // Calculate total cost
            $totalCost = $data['daily_rate'] * $data['total_days'];

            // Update the manpower resource
            $manpower->update([
                'employee_id' => $data['employee_id'] ?? null,
                'worker_name' => $data['worker_name'] ?? null,
                'job_title' => $data['job_title'],
                'start_date' => $data['start_date'],
                'end_date' => $data['end_date'] ?? null,
                'daily_rate' => $data['daily_rate'],
                'total_days' => $data['total_days'],
                'total_cost' => $totalCost,
                'notes' => $data['notes'] ?? null,
            ]);

            Log::info('Manpower resource updated successfully', [
                'manpower_id' => $manpower->id,
                'project_id' => $manpower->project_id,
                'employee_id' => $manpower->employee_id,
                'worker_name' => $manpower->worker_name,
            ]);

            return $manpower;
        } catch (\Exception $e) {
            Log::error('Failed to update manpower resource', [
                'manpower_id' => $manpower->id,
                'project_id' => $manpower->project_id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }
}
