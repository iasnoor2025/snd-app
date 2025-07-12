<?php

namespace Modules\ProjectManagement\Observers;

use Modules\ProjectManagement\Domain\Models\ProjectManpower;
use Modules\EmployeeManagement\Domain\Models\EmployeeAssignment;

class ProjectManpowerObserver
{
    public function created(ProjectManpower $manpower)
    {
        if ($manpower->employee_id && $manpower->project_id) {
            EmployeeAssignment::updateOrCreate(
                [
                    'employee_id' => $manpower->employee_id,
                    'project_id' => $manpower->project_id,
                    'type' => 'project',
                ],
                [
                    'name' => $manpower->project->name ?? 'Project Assignment',
                    'status' => 'active',
                    'location' => 'Project Location',
                    'start_date' => $manpower->start_date,
                    'end_date' => $manpower->end_date,
                    'notes' => $manpower->notes,
                ]
            );
        }
    }

    public function updated(ProjectManpower $manpower)
    {
        if ($manpower->employee_id && $manpower->project_id) {
            EmployeeAssignment::updateOrCreate(
                [
                    'employee_id' => $manpower->employee_id,
                    'project_id' => $manpower->project_id,
                    'type' => 'project',
                ],
                [
                    'name' => $manpower->project->name ?? 'Project Assignment',
                    'status' => 'active',
                    'location' => 'Project Location',
                    'start_date' => $manpower->start_date,
                    'end_date' => $manpower->end_date,
                    'notes' => $manpower->notes,
                ]
            );
        }
    }

    public function deleted(ProjectManpower $manpower)
    {
        if ($manpower->employee_id && $manpower->project_id) {
            EmployeeAssignment::where([
                'employee_id' => $manpower->employee_id,
                'project_id' => $manpower->project_id,
                'type' => 'project',
            ])->delete();
        }
    }
}
