<?php

namespace Modules\TimesheetManagement\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\View;
use Symfony\Component\HttpFoundation\Response;

class PaySlipPdfController extends Controller
{
    /**
     * Download the payslip as a PDF.
     *
     * @param Request $request
     * @return Response
     */
    public function download(Request $request): Response
    {
        $employeeId = $request->input('employee_id');
        $month = $request->input('month');
        $year = $request->input('year');

        // Parse employee
        $employee = \Modules\EmployeeManagement\Domain\Models\Employee::findOrFail($employeeId);
        $monthNum = str_pad($month, 2, '0', STR_PAD_LEFT);
        $startDate = "$year-$monthNum-01";
        $endDate = date('Y-m-t', strtotime($startDate));

        // Get timesheets for the month
        $timesheets = \Modules\TimesheetManagement\Domain\Models\Timesheet::where('employee_id', $employee->id)
            ->whereBetween('date', [$startDate, $endDate])
            ->orderBy('date')
            ->get();

        // Calculate totals
        $totalRegularHours = $timesheets->sum('hours_worked');
        $totalOvertimeHours = $timesheets->sum('overtime_hours');
        $totalHours = $totalRegularHours + $totalOvertimeHours;
        $daysWorked = $timesheets->count();

        // Create calendar data for the month
        $calendar = [];
        $daysInMonth = (int)date('t', strtotime($startDate));
        for ($d = 1; $d <= $daysInMonth; $d++) {
            $dateStr = sprintf('%04d-%02d-%02d', $year, $monthNum, str_pad($d, 2, '0', STR_PAD_LEFT));
            $dayOfWeek = date('w', strtotime($dateStr));
            $calendar[$dateStr] = [
                'date' => $dateStr,
                'day_of_week' => $dayOfWeek,
                'day_name' => date('l', strtotime($dateStr)),
                'regular_hours' => 0.0,
                'overtime_hours' => 0.0,
            ];
        }
        $grouped = $timesheets->groupBy(function($t) { return date('Y-m-d', strtotime($t->date)); });
        foreach ($grouped as $date => $items) {
            $dayOfWeek = date('w', strtotime($date));
            $calendar[$date] = [
                'date' => $date,
                'day_of_week' => $dayOfWeek,
                'day_name' => date('l', strtotime($date)),
                'regular_hours' => $items->sum('hours_worked'),
                'overtime_hours' => $items->sum('overtime_hours'),
            ];
        }

        // Calculate absent days (not Friday, no hours)
        $absentDays = 0;
        for ($d = 1; $d <= $daysInMonth; $d++) {
            $dateStr = sprintf('%04d-%02d-%02d', $year, $monthNum, str_pad($d, 2, '0', STR_PAD_LEFT));
            $day = $calendar[$dateStr];
            if ($day['regular_hours'] == 0 && $day['overtime_hours'] == 0) {
                $absentDays++;
            }
        }
        $totalWorkingDays = $daysInMonth;
        $absentDeduction = 0;
        if ($totalWorkingDays > 0 && $absentDays > 0) {
            $absentDeduction = ($employee->basic_salary / $totalWorkingDays) * $absentDays;
        }
        $basicSalary = $employee->basic_salary ?? 0;
        $totalAllowances = ($employee->food_allowance ?? 0) + ($employee->housing_allowance ?? 0) + ($employee->transport_allowance ?? 0);
        $overtimePay = method_exists($employee, 'calculateOvertimePay') ? $employee->calculateOvertimePay($totalOvertimeHours) : 0;
        $netSalary = $basicSalary + $totalAllowances + $overtimePay - $absentDeduction;

        $pdf = Pdf::loadView('TimesheetManagement::payslip', [
            'employee' => $employee,
            'month' => $monthNum,
            'year' => $year,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'calendar' => $calendar,
            'salary_details' => [
                'basic_salary' => $basicSalary,
                'total_allowances' => $totalAllowances,
                'absent_deduction' => $absentDeduction,
                'overtime_pay' => $overtimePay,
                'net_salary' => $netSalary,
            ],
            'absent_days' => $absentDays,
            'days_worked' => $daysWorked,
            'total_regular_hours' => $totalRegularHours,
            'total_overtime_hours' => $totalOvertimeHours,
            'total_hours' => $totalHours,
        ]);

        $filename = 'payslip_' . $employeeId . '_' . $monthNum . '_' . $year . '.pdf';
        return $pdf->download($filename);
    }
}
