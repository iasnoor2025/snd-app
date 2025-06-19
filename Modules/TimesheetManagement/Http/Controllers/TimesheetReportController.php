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
     * Export timesheet report
     */
    public function export(Request $request)
    {
        $request->validate([
            'format' => 'required|in:excel,pdf,csv',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'employee_ids' => 'array',
            'project_ids' => 'array',
        ]);

        try {
            $data = $this->getTimesheetData($request);
            $format = $request->input('format');
            $filename = 'timesheet_report_' . now()->format('Y_m_d_H_i_s');

            switch ($format) {
                case 'excel':
                    return $this->exportToExcel($data, $filename);
                case 'pdf':
                    return $this->exportToPdf($data, $filename);
                case 'csv':
                    return $this->exportToCsv($data, $filename);
                default:
                    throw new \Exception('Invalid export format');
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Export failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export to Excel format
     */
    private function exportToExcel($data, $filename)
    {
        $headers = [
            'Employee Name',
            'Date',
            'Project',
            'Clock In',
            'Clock Out',
            'Regular Hours',
            'Overtime Hours',
            'Total Hours',
            'Status'
        ];

        $rows = [];
        foreach ($data as $timesheet) {
            $rows[] = [
                $timesheet->employee->full_name ?? 'N/A',
                $timesheet->date ? Carbon::parse($timesheet->date)->format('Y-m-d') : 'N/A',
                $timesheet->project->name ?? 'N/A',
                $timesheet->clock_in ? Carbon::parse($timesheet->clock_in)->format('H:i') : 'N/A',
                $timesheet->clock_out ? Carbon::parse($timesheet->clock_out)->format('H:i') : 'N/A',
                $timesheet->regular_hours ?? 0,
                $timesheet->overtime_hours ?? 0,
                ($timesheet->regular_hours ?? 0) + ($timesheet->overtime_hours ?? 0),
                ucfirst($timesheet->status ?? 'pending')
            ];
        }

        $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Set headers
        foreach ($headers as $index => $header) {
            $sheet->setCellValue(chr(65 + $index) . '1', $header);
        }

        // Set data
        foreach ($rows as $rowIndex => $row) {
            foreach ($row as $colIndex => $value) {
                $sheet->setCellValue(chr(65 + $colIndex) . ($rowIndex + 2), $value);
            }
        }

        $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
        
        return response()->streamDownload(function() use ($writer) {
            $writer->save('php://output');
        }, $filename . '.xlsx', [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    /**
     * Export to PDF format
     */
    private function exportToPdf($data, $filename)
    {
        $pdf = app('dompdf.wrapper');
        $html = view('timesheets.reports.pdf', compact('data'))->render();
        $pdf->loadHTML($html);
        
        return $pdf->download($filename . '.pdf');
    }

    /**
     * Export to CSV format
     */
    private function exportToCsv($data, $filename)
    {
        $headers = [
            'Employee Name',
            'Date', 
            'Project',
            'Clock In',
            'Clock Out',
            'Regular Hours',
            'Overtime Hours',
            'Total Hours',
            'Status'
        ];

        return response()->streamDownload(function() use ($data, $headers) {
            $output = fopen('php://output', 'w');
            fputcsv($output, $headers);
            
            foreach ($data as $timesheet) {
                fputcsv($output, [
                    $timesheet->employee->full_name ?? 'N/A',
                    $timesheet->date ? Carbon::parse($timesheet->date)->format('Y-m-d') : 'N/A',
                    $timesheet->project->name ?? 'N/A',
                    $timesheet->clock_in ? Carbon::parse($timesheet->clock_in)->format('H:i') : 'N/A',
                    $timesheet->clock_out ? Carbon::parse($timesheet->clock_out)->format('H:i') : 'N/A',
                    $timesheet->regular_hours ?? 0,
                    $timesheet->overtime_hours ?? 0,
                    ($timesheet->regular_hours ?? 0) + ($timesheet->overtime_hours ?? 0),
                    ucfirst($timesheet->status ?? 'pending')
                ]);
            }
            
            fclose($output);
        }, $filename . '.csv', [
            'Content-Type' => 'text/csv',
        ]);
    }

    /**
     * Get timesheet data for export
     */
    private function getTimesheetData(Request $request)
    {
        $query = \Modules\TimesheetManagement\Domain\Models\Timesheet::with(['employee', 'project'])
            ->whereBetween('date', [$request->start_date, $request->end_date]);

        if ($request->has('employee_ids') && !empty($request->employee_ids)) {
            $query->whereIn('employee_id', $request->employee_ids);
        }

        if ($request->has('project_ids') && !empty($request->project_ids)) {
            $query->whereIn('project_id', $request->project_ids);
        }

        return $query->orderBy('date', 'desc')->get();
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

        // Calculate payslip data
        $hourlyRate = $employee->hourly_rate ?? 0;
        $overtimeRate = $hourlyRate * 1.5; // 1.5x overtime rate
        
        $regularPay = $totalRegularHours * $hourlyRate;
        $overtimePay = $totalOvertimeHours * $overtimeRate;
        $grossPay = $regularPay + $overtimePay;
        
        // Calculate deductions
        $taxRate = 0.15; // 15% tax rate
        $socialSecurityRate = 0.095; // 9.5% social security
        $medicalInsuranceRate = 0.02; // 2% medical insurance
        
        $tax = $grossPay * $taxRate;
        $socialSecurity = $grossPay * $socialSecurityRate;
        $medicalInsurance = $grossPay * $medicalInsuranceRate;
        $totalDeductions = $tax + $socialSecurity + $medicalInsurance;
        
        $netPay = $grossPay - $totalDeductions;

        $data = [
            'employee' => $employee,
            'month' => $monthDate->format('F Y'),
            'timesheets' => $timesheets,
            'totalRegularHours' => $totalRegularHours,
            'totalOvertimeHours' => $totalOvertimeHours,
            'hourlyRate' => $hourlyRate,
            'overtimeRate' => $overtimeRate,
            'regularPay' => $regularPay,
            'overtimePay' => $overtimePay,
            'grossPay' => $grossPay,
            'tax' => $tax,
            'socialSecurity' => $socialSecurity,
            'medicalInsurance' => $medicalInsurance,
            'totalDeductions' => $totalDeductions,
            'netPay' => $netPay,
        ];

        return view('timesheetmanagement::payslips.show', $data);
    }

    /**
     * Generate payslip for employee
     */
    public function generatePayslip(Request $request, $employeeId) 
    {
        $request->validate([
            'month' => 'required|date_format:Y-m',
            'format' => 'in:pdf,html'
        ]);

        try {
            $employee = \Modules\EmployeeManagement\Domain\Models\Employee::findOrFail($employeeId);
            $month = $request->input('month');
            $format = $request->input('format', 'pdf');

            // Get timesheet data for the month
            $timesheets = \Modules\TimesheetManagement\Domain\Models\Timesheet::where('employee_id', $employeeId)
                ->whereRaw('DATE_FORMAT(date, "%Y-%m") = ?', [$month])
                ->get();

            // Calculate payroll data
            $regularHours = $timesheets->sum('regular_hours') ?? 0;
            $overtimeHours = $timesheets->sum('overtime_hours') ?? 0;
            $totalHours = $regularHours + $overtimeHours;

            $hourlyRate = $employee->hourly_rate ?? 0;
            $overtimeRate = $hourlyRate * 1.5; // 1.5x for overtime

            $regularPay = $regularHours * $hourlyRate;
            $overtimePay = $overtimeHours * $overtimeRate;
            $grossPay = $regularPay + $overtimePay;

            // Calculate deductions (simplified)
            $taxRate = 0.15; // 15% tax
            $tax = $grossPay * $taxRate;
            $netPay = $grossPay - $tax;

            $payslipData = [
                'employee' => $employee,
                'month' => $month,
                'regularHours' => $regularHours,
                'overtimeHours' => $overtimeHours,
                'totalHours' => $totalHours,
                'hourlyRate' => $hourlyRate,
                'overtimeRate' => $overtimeRate,
                'regularPay' => $regularPay,
                'overtimePay' => $overtimePay,
                'grossPay' => $grossPay,
                'tax' => $tax,
                'netPay' => $netPay,
                'timesheets' => $timesheets
            ];

            if ($format === 'pdf') {
                $pdf = app('dompdf.wrapper');
                $html = view('timesheets.payslip.pdf', $payslipData)->render();
                $pdf->loadHTML($html);
                
                return $pdf->download("payslip_{$employee->employee_id}_{$month}.pdf");
            } else {
                return view('timesheets.payslip.html', $payslipData);
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Payslip generation failed: ' . $e->getMessage()
            ], 500);
        }
    }
}


