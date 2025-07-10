<?php

namespace Modules\ProjectManagement\Actions\ProjectResources;

use Modules\ProjectManagement\Domain\Models\Project;
use Modules\ProjectManagement\Domain\Models\ProjectManpower;
use Modules\EmployeeManagement\Domain\Models\Employee;
use Illuminate\Support\Facades\Log;

class CreateManpower
{
    /**
     * Execute the action to create a new manpower resource.
     *
     * @param Project $project The project to add manpower to
     * @param array $data The validated data for creating the manpower resource
     * @return ProjectManpower The created manpower resource
     */
    public function execute(Project $project, array $data): ProjectManpower
    {
        try {
            // Calculate total cost
            $totalCost = $data['daily_rate'] * $data['total_days'];

            // Set worker_name to employee full_name if employee_id is present
            $workerName = null;
            if (!empty($data['employee_id'])) {
                $employee = Employee::find($data['employee_id']);
                $workerName = $employee ? $employee->full_name : null;
            } else {
                $workerName = $data['worker_name'] ?? null;
            }

            // Create the manpower resource
            $manpower = $project->manpower()->create([
                'employee_id' => $data['employee_id'] ?? null,
                'worker_name' => $workerName,
                'job_title' => $data['job_title'],
                'start_date' => $data['start_date'],
                'end_date' => $data['end_date'] ?? null,
                'daily_rate' => $data['daily_rate'],
                'total_days' => $data['total_days'],
                'total_cost' => $totalCost,
                'notes' => $data['notes'] ?? null,
            ]);

            Log::info('Manpower resource created successfully', [
                'project_id' => $project->id,
                'manpower_id' => $manpower->id,
                'employee_id' => $manpower->employee_id,
                'worker_name' => $manpower->worker_name,
            ]);

            return $manpower;
        } catch (\Exception $e) {
            Log::error('Failed to create manpower resource', [
                'project_id' => $project->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }
}
