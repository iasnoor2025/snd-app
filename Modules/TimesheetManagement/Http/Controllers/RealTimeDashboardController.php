<?php

namespace Modules\TimesheetManagement\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Modules\TimesheetManagement\Domain\Models\Timesheet;
use Carbon\Carbon;

class RealTimeDashboardController extends Controller
{
    public function __invoke(Request $request)
    {
        $today = Carbon::today();
        $now = Carbon::now();
        $timesheets = Timesheet::with(['employee:id,first_name,last_name', 'project:id,name'])
            ->whereDate('date', $today)
            ->orderByDesc('created_at')
            ->get();

        $totalHours = $timesheets->sum('hours_worked');
        $activeEmployees = $timesheets->pluck('employee_id')->unique()->count();
        $overtimeHours = $timesheets->sum('overtime_hours');

        $recentEntries = $timesheets->take(20)->map(function ($entry) {
            return [
                'id' => $entry->id,
                'employee' => [
                    'id' => $entry->employee->id,
                    'name' => $entry->employee->first_name . ' ' . $entry->employee->last_name,
                ],
                'project' => [
                    'id' => $entry->project?->id,
                    'name' => $entry->project?->name,
                ],
                'date' => $entry->date->toDateString(),
                'hours' => $entry->hours_worked,
                'is_overtime' => $entry->overtime_hours > 0,
                'start_time' => $entry->start_time,
                'end_time' => $entry->end_time,
                'created_at' => $entry->created_at->toDateTimeString(),
            ];
        });

        return response()->json([
            'stats' => [
                'totalHours' => $totalHours,
                'activeEmployees' => $activeEmployees,
                'overtimeHours' => $overtimeHours,
                'lastUpdated' => $now->toDateTimeString(),
            ],
            'recentEntries' => $recentEntries,
        ]);
    }
}
