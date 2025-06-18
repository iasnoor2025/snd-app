<?php

namespace Modules\TimesheetManagement\Http\Controllers;

use Illuminate\Contracts\Support\Renderable;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;
use Modules\TimesheetManagement\Domain\Models\Timesheet;
use Modules\EmployeeManagement\Domain\Models\Employee;

class TimesheetReportController extends Controller
{
    /**
     * Display the reports index page.
     * @return Renderable;
     */
    public function index()
    {
        // Get all employees for filter
        $employees = Employee::orderBy('first_name')->get(['id', 'first_name', 'last_name']);

        return Inertia::render('TimesheetManagement::Reports/Index', [
            'employees' => $employees,
            'currentMonth' => now()->format('Y-m'),
        ]);
    }

    /**
     * Generate a monthly timesheet report.
     * @param Request $request
     * @return Renderable;
     */
    public function generate(Request $request)
    {
        $request->validate([
            'month' => 'required|date_format:Y-m',
            'employee_id' => 'nullable|exists:employees,id',
            'report_type' => 'required|in:monthly,summary,detailed',
        ]);

        $reportType = $request->input('report_type', 'monthly');

        if ($reportType === 'monthly') {
            return $this->monthlyReport($request);
        } elseif ($reportType === 'summary') {
            return $this->summaryReport($request);
        } else {
            return $this->detailedReport($request);
        }
    }

    /**
     * Generate a monthly timesheet report.
     * @param Request $request
     * @return Renderable;
     */
    private function monthlyReport(Request $request)
    {
        $monthYear = $request->input('month', now()->format('Y-m'));
        $employeeId = $request->input('employee_id');

        $month = Carbon::parse($monthYear);
        $startDate = $month->copy()->startOfMonth();
        $endDate = $month->copy()->endOfMonth();

        $query = Timesheet::with(['employee', 'project'])
            ->whereBetween('date', [$startDate, $endDate]);

        if ($employeeId) {
            $query->where('employee_id', $employeeId);
        } elseif (!auth()->user()->hasRole(['admin', 'hr'])) {
            // If user is not admin/hr, only show their own timesheets
            $query->where('employee_id', auth()->user()->employee->id);
        }

        $timesheets = $query->orderBy('date')->get();

        // Group by employee
        $employeeTimesheets = $timesheets->groupBy('employee_id');

        $summaryData = [];
        foreach ($employeeTimesheets as $empId => $empTimesheets) {
            $employee = $empTimesheets->first()->employee;

            $summaryData[] = [
                'employee' => [
                    'id' => $employee->id,
                    'name' => $employee->first_name . ' ' . $employee->last_name,
                ],
                'total_days' => $empTimesheets->count(),
                'total_hours' => $empTimesheets->sum('hours_worked'),
                'total_overtime' => $empTimesheets->sum('overtime_hours'),
                'projects' => $empTimesheets->groupBy('project_id')->map(function ($items, $projectId) {
                    $project = $items->first()->project;
                    return [
                        'id' => $projectId,
                        'name' => $project ? $project->name : 'No Project',
                        'hours' => $items->sum('hours_worked'),
                        'overtime' => $items->sum('overtime_hours'),
                    ];
                })->values()->all(),
            ];
        }

        // Get all employees for filter
        $employees = Employee::orderBy('first_name')->get(['id', 'first_name', 'last_name']);

        return Inertia::render('TimesheetManagement::Reports/Monthly', [
            'summary' => $summaryData,
            'employees' => $employees,
            'filters' => [
                'month' => $monthYear,
                'employee_id' => $employeeId,
            ],
        ]);
    }

    /**
     * Generate a summary timesheet report.
     * @param Request $request
     * @return Renderable;
     */
    private function summaryReport(Request $request)
    {
        $monthYear = $request->input('month', now()->format('Y-m'));
        $employeeId = $request->input('employee_id');

        $month = Carbon::parse($monthYear);
        $startDate = $month->copy()->startOfMonth();
        $endDate = $month->copy()->endOfMonth();

        $query = Timesheet::with(['employee:id,first_name,last_name', 'project:id,name'])
            ->whereBetween('date', [$startDate, $endDate]);

        if ($employeeId) {
            $query->where('employee_id', $employeeId);
        } elseif (!auth()->user()->hasRole(['admin', 'hr'])) {
            // If user is not admin/hr, only show their own timesheets
            $query->where('employee_id', auth()->user()->employee->id);
        }

        // Group by day
        $timesheetsByDay = $query->get()
            ->groupBy(function ($timesheet) {
                return $timesheet->date->format('Y-m-d');
            });

        $dailySummary = [];
        $totalHours = 0;
        $totalOvertime = 0;

        foreach ($timesheetsByDay as $date => $timesheets) {
            $dayTotal = $timesheets->sum('hours_worked');
            $dayOvertime = $timesheets->sum('overtime_hours');

            $totalHours += $dayTotal;
            $totalOvertime += $dayOvertime;

            $dailySummary[] = [
                'date' => $date,
                'day_name' => Carbon::parse($date)->format('l'),
                'total_hours' => $dayTotal,
                'total_overtime' => $dayOvertime,
                'employees' => $timesheets->count(),
            ];
        }

        // Get all employees for filter
        $employees = Employee::orderBy('first_name')->get(['id', 'first_name', 'last_name']);

        return Inertia::render('TimesheetManagement::Reports/Summary', [
            'dailySummary' => $dailySummary,
            'totalHours' => $totalHours,
            'totalOvertime' => $totalOvertime,
            'totalDays' => count($dailySummary),
            'employees' => $employees,
            'filters' => [
                'month' => $monthYear,
                'employee_id' => $employeeId,
            ],
        ]);
    }

    /**
     * Generate a detailed timesheet report.
     * @param Request $request
     * @return Renderable;
     */
    private function detailedReport(Request $request)
    {
        $monthYear = $request->input('month', now()->format('Y-m'));
        $employeeId = $request->input('employee_id');

        $month = Carbon::parse($monthYear);
        $startDate = $month->copy()->startOfMonth();
        $endDate = $month->copy()->endOfMonth();

        $query = Timesheet::with(['employee', 'project', 'rental', 'foremanApprover', 'inchargeApprover', 'checkingApprover', 'managerApprover', 'rejector'])
            ->whereBetween('date', [$startDate, $endDate]);

        if ($employeeId) {
            $query->where('employee_id', $employeeId);
        } elseif (!auth()->user()->hasRole(['admin', 'hr'])) {
            // If user is not admin/hr, only show their own timesheets
            $query->where('employee_id', auth()->user()->employee->id);
        }

        $timesheets = $query->orderBy('date')->paginate(20);

        // Get all employees for filter
        $employees = Employee::orderBy('first_name')->get(['id', 'first_name', 'last_name']);

        return Inertia::render('TimesheetManagement::Reports/Detailed', [
            'timesheets' => $timesheets,
            'employees' => $employees,
            'filters' => [
                'month' => $monthYear,
                'employee_id' => $employeeId,
            ],
        ]);
    }

    /**
     * Export timesheet data to Excel/CSV.
     * @param Request $request
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse;
     */
    public function export(Request $request)
    {
        $request->validate([
            'month' => 'required|date_format:Y-m',
            'employee_id' => 'nullable|exists:employees,id',
            'format' => 'required|in:excel,csv',
        ]);

        $monthYear = $request->input('month');
        $employeeId = $request->input('employee_id');
        $format = $request->input('format', 'excel');

        $month = Carbon::parse($monthYear);
        $startDate = $month->copy()->startOfMonth();
        $endDate = $month->copy()->endOfMonth();

        $query = Timesheet::with(['employee', 'project', 'rental'])
            ->whereBetween('date', [$startDate, $endDate]);

        if ($employeeId) {
            $query->where('employee_id', $employeeId);
        } elseif (!auth()->user()->hasRole(['admin', 'hr'])) {
            // If user is not admin/hr, only show their own timesheets
            $query->where('employee_id', auth()->user()->employee->id);
        }

        $timesheets = $query->orderBy('date')->get();

        // Generate export filename
        $filename = 'timesheets_' . $monthYear;
        if ($employeeId) {
            // Ensure ID is numeric
            if (!is_numeric($employeeId)) {
                abort(404, 'Invalid ID provided');
            }

            $employee = Employee::find($employeeId);
            if ($employee) {
                $filename .= '_' . strtolower(
                    str_replace(' ', '_', $employee->first_name . '_' . $employee->last_name)
                );
            }
        }

        // TODO: Implement actual export using a library like Laravel Excel
        // For now, just return a JSON response;
        return response()->json([
            'message' => 'Export functionality will be implemented in a future update.',
            'data' => [
                'month' => $monthYear,
                'employee_id' => $employeeId,
                'format' => $format,
                'count' => $timesheets->count(),
            ]
        ]);
    }

    /**
     * Generate a payslip for an employee.
     * @param int $employeeId
     * @param string $month
     * @return \Illuminate\View\View;
     */
    public function generatePaySlip($employeeId, $month)
    {
        $employee = Employee::findOrFail($employeeId);
        $monthDate = Carbon::parse($month);

        // Get all timesheets for this employee in the specified month
        $timesheets = Timesheet::where('employee_id', $employeeId)
            ->whereMonth('date', $monthDate->month)
            ->whereYear('date', $monthDate->year)
            ->where('status', Timesheet::STATUS_MANAGER_APPROVED)
            ->get();

        $totalRegularHours = $timesheets->sum('hours_worked');
        $totalOvertimeHours = $timesheets->sum('overtime_hours');

        // TODO: Implement payslip calculation logic

        $data = [
            'employee' => $employee,
            'month' => $monthDate->format('F Y'),
            'timesheets' => $timesheets,
            'totalRegularHours' => $totalRegularHours,
            'totalOvertimeHours' => $totalOvertimeHours,
            // Add more payslip data as needed
        ];

        return view('timesheetmanagement::payslips.show', $data);
    }
}


