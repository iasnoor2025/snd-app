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
        $employee = \Modules\EmployeeManagement\Domain\Models\Employee::findOrFail($employeeId);
        $timesheets = \Modules\TimesheetManagement\Domain\Models\Timesheet::where('employee_id', $employeeId)
            ->whereBetween('date', [$start, $end])
            ->orderBy('date')
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
        foreach ($timesheets as $t) {
            $date = $t->date->format('Y-m-d');
            if (isset($calendar[$date])) {
                $calendar[$date]['regular_hours'] += $t->hours_worked;
                $calendar[$date]['overtime_hours'] += $t->overtime_hours;
            }
        }
        return response()->json([
            'calendar' => array_values($calendar),
            'timesheets' => $timesheets,
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


