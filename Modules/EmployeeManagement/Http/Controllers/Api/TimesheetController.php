<?php

namespace Modules\EmployeeManagement\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TimesheetController extends Controller
{
    /**
     * Get pending timesheets awaiting approval
     */
    public function pending(): JsonResponse
    {
        // Remove all usages of EmployeeTimesheetService and related logic
        return response()->json([]);
    }

    /**
     * Get approved timesheets for a date range
     */
    public function approved(Request $request): JsonResponse
    {
        // Remove all usages of EmployeeTimesheetService and related logic
        return response()->json([]);
    }

    /**
     * Get timesheets for payroll processing
     */
    public function forPayroll(Request $request): JsonResponse
    {
        // Remove all usages of EmployeeTimesheetService and related logic
        return response()->json([]);
    }

    /**
     * Bulk approve timesheets
     */
    public function bulkApprove(Request $request): JsonResponse
    {
        // Remove all usages of EmployeeTimesheetService and related logic
        return response()->json([]);
    }

    /**
     * Get employee timesheets
     */
    public function byEmployee(Request $request, int $employeeId): JsonResponse
    {
        $start = $request->query('start_date');
        $end = $request->query('end_date');
        $page = $request->query('page', 1);
        $perPage = $request->query('per_page', 10);

        $employee = \Modules\EmployeeManagement\Domain\Models\Employee::findOrFail($employeeId);

        // Get paginated timesheets
        $timesheetsQuery = \Modules\TimesheetManagement\Domain\Models\Timesheet::with('project')
            ->where('employee_id', $employeeId)
            ->whereBetween('date', [$start, $end])
            ->orderBy('date', 'desc');

        $totalItems = $timesheetsQuery->count();
        $timesheets = $timesheetsQuery->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();

        $daysInMonth = (int)date('t', strtotime($start));
        $calendar = [];
        for ($d = 1; $d <= $daysInMonth; $d++) {
            $dateStr = date('Y-m-d', strtotime("$start +" . ($d - 1) . " days"));
            $dayOfWeek = date('w', strtotime($dateStr));
            $dayName = date('D', strtotime($dateStr));
            $calendar[$dateStr] = [
                'date' => $dateStr,
                'day_of_week' => $dayOfWeek,
                'day_name' => $dayName,
                'regular_hours' => 0.0,
                'overtime_hours' => 0.0,
            ];
        }

        // Get all timesheets for calendar (not paginated)
        $allTimesheets = \Modules\TimesheetManagement\Domain\Models\Timesheet::where('employee_id', $employeeId)
            ->whereBetween('date', [$start, $end])
            ->get();

        foreach ($allTimesheets as $t) {
            $date = $t->date->format('Y-m-d');
            if (isset($calendar[$date])) {
                $calendar[$date]['regular_hours'] += $t->hours_worked;
                $calendar[$date]['overtime_hours'] += $t->overtime_hours;
            }
        }

        // Transform timesheets for frontend
        $timesheetData = $timesheets->map(function ($t) {
            return [
                'id' => $t->id,
                'employee_id' => $t->employee_id,
                'date' => $t->date->format('Y-m-d'),
                'clock_in' => $t->start_time,
                'clock_out' => $t->end_time,
                'break_start' => $t->break_start,
                'break_end' => $t->break_end,
                'regular_hours' => $t->hours_worked,
                'overtime_hours' => $t->overtime_hours,
                'total_hours' => $t->hours_worked + $t->overtime_hours,
                'status' => $t->status,
                'notes' => $t->notes,
                'project_id' => $t->project_id,
                'project' => $t->project ? [
                    'id' => $t->project->id,
                    'name' => $t->project->name
                ] : null,
            ];
        });

        return response()->json([
            'calendar' => array_values($calendar),
            'timesheets' => $timesheetData,
            'total' => $totalItems,
            'current_page' => (int)$page,
            'per_page' => (int)$perPage,
            'last_page' => ceil($totalItems / $perPage),
        ]);
    }

    /**
     * Get total hours for an employee
     */
    public function totalHours(Request $request, int $employeeId): JsonResponse
    {
        $start = $request->query('start_date');
        $end = $request->query('end_date');
        $timesheets = \Modules\TimesheetManagement\Domain\Models\Timesheet::where('employee_id', $employeeId)
            ->whereBetween('date', [$start, $end])
            ->get();
        $regular_hours = (float) $timesheets->sum('hours_worked');
        $overtime_hours = (float) $timesheets->sum('overtime_hours');
        $total_hours = $regular_hours + $overtime_hours;
        $days_worked = $timesheets->count();
        return response()->json([
            'regular_hours' => $regular_hours,
            'overtime_hours' => $overtime_hours,
            'total_hours' => $total_hours,
            'days_worked' => $days_worked,
        ]);
    }
}


