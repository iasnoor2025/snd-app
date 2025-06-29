<?php

namespace Modules\TimesheetManagement\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Modules\TimesheetManagement\Domain\Models\Timesheet;
use Modules\EmployeeManagement\Domain\Models\Employee;
use Modules\ProjectManagement\Domain\Models\Project;
use Carbon\Carbon;

class CustomReportController extends Controller
{
    public function __invoke(Request $request)
    {
        $fields = $request->input('fields', []);
        $filters = $request->input('filters', []);
        $groupBy = $request->input('groupBy', null);

        $query = Timesheet::query();

        if (!empty($filters['startDate'])) {
            $query->where('date', '>=', $filters['startDate']);
        }
        if (!empty($filters['endDate'])) {
            $query->where('date', '<=', $filters['endDate']);
        }
        if (!empty($filters['employeeId'])) {
            $query->where('employee_id', $filters['employeeId']);
        }
        if (!empty($filters['projectId'])) {
            $query->where('project_id', $filters['projectId']);
        }

        $query->with(['employee:id,first_name,last_name', 'project:id,name']);
        $rows = $query->get();

        $report = $rows->map(function ($row) use ($fields) {
            $result = [];
            foreach ($fields as $field) {
                switch ($field) {
                    case 'date':
                        $result['date'] = $row->date->toDateString();
                        break;
                    case 'employee':
                        $result['employee'] = $row->employee ? $row->employee->first_name . ' ' . $row->employee->last_name : '';
                        break;
                    case 'project':
                        $result['project'] = $row->project ? $row->project->name : '';
                        break;
                    case 'hours_worked':
                        $result['hours_worked'] = $row->hours_worked;
                        break;
                    case 'overtime_hours':
                        $result['overtime_hours'] = $row->overtime_hours;
                        break;
                    case 'status':
                        $result['status'] = $row->status;
                        break;
                }
            }
            return $result;
        });

        // Optionally group by
        if ($groupBy && in_array($groupBy, $fields)) {
            $grouped = $report->groupBy($groupBy)->map(function ($items, $key) {
                return [
                    $groupBy => $key,
                    'rows' => $items->values(),
                ];
            })->values();
            return response()->json(['report' => $grouped]);
        }

        return response()->json(['report' => $report]);
    }
}
