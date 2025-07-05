<?php

namespace Modules\TimesheetManagement\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Modules\TimesheetManagement\Domain\Models\TimeEntry;
use Modules\EmployeeManagement\Domain\Models\Employee;
use Modules\ProjectManagement\Domain\Models\Project;

class BillableHoursReportController extends Controller
{
    public function __invoke(Request $request)
    {
        $filters = $request->all();
        $query = TimeEntry::query();

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

        $totalBillable = $rows->where('is_billable', true)->sum('hours');
        $totalNonBillable = $rows->where('is_billable', false)->sum('hours');

        $entries = $rows->map(function ($row) {
            return [
                'date' => $row->date?->format('Y-m-d')->toDateString(),
                'employee' => $row->employee ? $row->employee->first_name . ' ' . $row->employee->last_name : '',
                'project' => $row->project ? $row->project->name : '',
                'hours' => $row->hours,
                'is_billable' => $row->is_billable,
            ];
        });

        return response()->json([
            'totalBillable' => $totalBillable,
            'totalNonBillable' => $totalNonBillable,
            'entries' => $entries,
        ]);
    }
}
