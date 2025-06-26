<?php

namespace Modules\Payroll\Http\Controllers;

use Modules\EmployeeManagement\Domain\Models\Employee;
use Modules\Payroll\Domain\Models\FinalSettlement;
use Modules\Payroll\Domain\Models\SettlementDeduction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Carbon\Carbon;
use Modules\Payroll\Domain\Models\Payroll;
use Modules\TimesheetManagement\Domain\Models\Timesheet;

class FinalSettlementController extends Controller
{
    /**
     * Display a listing of final settlements
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', FinalSettlement::class);

        $query = FinalSettlement::with(['employee:id,first_name,last_name', 'approver', 'payer'])
            ->when($request->status, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->when($request->employee_id, function ($query, $employeeId) {
                return $query->where('employee_id', $employeeId);
            });

        // If user is not admin/hr, only show their own settlements
        if (!auth()->user()->hasRole(['admin', 'hr'])) {
            $query->where('employee_id', auth()->user()->employee->id);
        }

        $settlements = $query->latest()->paginate(10);

        return Inertia::render('FinalSettlements/Index', [
            'settlements' => $settlements,
            'filters' => $request->only(['status', 'employee_id'])
        ]);
    }

    /**
     * Show the form for creating a new final settlement
     */
    public function create()
    {
        $employees = Employee::active()->get();

        return Inertia::render('FinalSettlement/Create', [
            'employees' => $employees,
        ]);
    }

    /**
     * Store a newly created final settlement
     */
    public function store(Request $request)
    {
        $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'settlement_date' => 'required|date',
            'notes' => 'nullable|string|max:500',
        ]);

        $employee = Employee::findOrFail($request->employee_id);

        DB::beginTransaction();

        try {
            // Get unpaid salary
            $lastPaidPayroll = Payroll::where('employee_id', $employee->id)
                ->where('status', 'paid')
                ->orderBy('year', 'desc')
                ->orderBy('month', 'desc')
                ->first();

            $unpaidSalary = 0;
            if ($lastPaidPayroll) {
                $lastPaidDate = Carbon::create($lastPaidPayroll->year, $lastPaidPayroll->month, 1);
                $unpaidMonths = $lastPaidDate->diffInMonths(Carbon::parse($request->settlement_date));

                if ($unpaidMonths > 0) {
                    $unpaidSalary = $employee->base_salary * $unpaidMonths;
                }
            }

            // Get overtime amount
            $overtimeAmount = Timesheet::where('employee_id', $employee->id)
                ->where('status', 'approved')
                ->whereNull('payroll_id')
                ->sum('overtime_amount');

            // Get pending bonuses
            $bonusAmount = Payroll::where('employee_id', $employee->id)
                ->where('status', 'approved')
                ->whereNull('paid_at')
                ->sum('bonus_amount');

            // Get pending deductions
            $deductionAmount = Payroll::where('employee_id', $employee->id)
                ->where('status', 'approved')
                ->whereNull('paid_at')
                ->sum('deduction_amount');

            // Calculate leave encashment
            $leaveEncashment = $this->calculateLeaveEncashment($employee);

            // Create settlement
            $settlement = FinalSettlement::create([
                'employee_id' => $employee->id,
                'settlement_date' => $request->settlement_date,
                'unpaid_salary' => $unpaidSalary,
                'overtime_amount' => $overtimeAmount,
                'bonus_amount' => $bonusAmount,
                'deduction_amount' => $deductionAmount,
                'leave_encashment' => $leaveEncashment,
                'notes' => $request->notes,
                'status' => 'pending',
            ]);

            $settlement->calculateFinalAmount();

            DB::commit();

            return redirect()->route('final-settlements.show', $settlement)
                ->with('success', 'Final settlement created successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Display the specified final settlement
     */
    public function show(FinalSettlement $finalSettlement)
    {
        $this->authorize('view', $finalSettlement);

        $finalSettlement->load(['employee', 'approver', 'payer', 'items']);

        return Inertia::render('FinalSettlement/Show', [
            'finalSettlement' => $finalSettlement,
        ]);
    }

    /**
     * Approve the specified final settlement
     */
    public function approve(FinalSettlement $finalSettlement)
    {
        if (!$finalSettlement->isPending()) {
            return back()->withErrors([
                'message' => 'Only pending settlements can be approved.',
            ]);
        }

        $finalSettlement->approve(auth()->user());

        return back()->with('success', 'Final settlement approved successfully.');
    }

    /**
     * Process payment for the specified final settlement
     */
    public function processPayment(FinalSettlement $finalSettlement)
    {
        $finalSettlement->markAsPaid(auth()->user());

        return back()->with('success', 'Payment processed successfully.');
    }

    /**
     * Cancel the specified final settlement
     */
    public function cancel(FinalSettlement $finalSettlement)
    {
        $finalSettlement->cancel();

        return back()->with('success', 'Final settlement cancelled successfully.');
    }

    /**
     * Generate settlement report
     */
    public function generateReport(FinalSettlement $finalSettlement)
    {
        $report = $finalSettlement->generateSettlementReport();

        return response()->json($report);
    }

    /**
     * Generate PDF for final settlement
     */
    public function generatePDF(FinalSettlement $finalSettlement)
    {
        $this->authorize('view', $finalSettlement);

        $finalSettlement->load(['employee', 'approver', 'payer', 'deductions_list']);

        $html = $this->generateSettlementHTML($finalSettlement);
        
        $filename = "final-settlement-{$finalSettlement->id}-{$finalSettlement->employee->employee_id}.pdf";
        
        return response($html, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ]);
    }

    /**
     * Generate HTML content for settlement PDF
     */
    private function generateSettlementHTML(FinalSettlement $finalSettlement)
    {
        $employee = $finalSettlement->employee;
        
        $html = '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Final Settlement - ' . $employee->employee_id . '</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .company-name { font-size: 24px; font-weight: bold; color: #333; }
        .document-title { font-size: 18px; margin-top: 10px; }
        .section { margin: 20px 0; }
        .section-title { font-size: 16px; font-weight: bold; border-bottom: 2px solid #333; padding-bottom: 5px; margin-bottom: 15px; }
        .info-table { width: 100%; border-collapse: collapse; }
        .info-table td { padding: 8px; border-bottom: 1px solid #ddd; }
        .info-table .label { font-weight: bold; width: 30%; }
        .calculation-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        .calculation-table th, .calculation-table td { padding: 10px; border: 1px solid #ddd; text-align: left; }
        .calculation-table th { background-color: #f5f5f5; font-weight: bold; }
        .total-row { font-weight: bold; background-color: #f9f9f9; }
        .amount { text-align: right; }
        .footer { margin-top: 40px; }
        .signature-section { display: flex; justify-content: space-between; margin-top: 50px; }
        .signature-box { width: 200px; text-align: center; }
        .signature-line { border-top: 1px solid #333; margin-top: 50px; padding-top: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">' . config('app.name', 'Company Name') . '</div>
        <div class="document-title">FINAL SETTLEMENT STATEMENT</div>
        <div>Settlement ID: #' . $finalSettlement->id . '</div>
    </div>

    <div class="section">
        <div class="section-title">Employee Information</div>
        <table class="info-table">
            <tr>
                <td class="label">Employee ID:</td>
                <td>' . $employee->employee_id . '</td>
                <td class="label">Name:</td>
                <td>' . $employee->first_name . ' ' . $employee->last_name . '</td>
            </tr>
            <tr>
                <td class="label">Department:</td>
                <td>' . ($employee->department ?? 'N/A') . '</td>
                <td class="label">Position:</td>
                <td>' . ($employee->position->name ?? 'N/A') . '</td>
            </tr>
            <tr>
                <td class="label">Hire Date:</td>
                <td>' . ($employee->hire_date ? Carbon::parse($employee->hire_date)->format('d/m/Y') : 'N/A') . '</td>
                <td class="label">Last Working Day:</td>
                <td>' . Carbon::parse($finalSettlement->last_working_day)->format('d/m/Y') . '</td>
            </tr>
        </table>
    </div>

    <div class="section">
        <div class="section-title">Settlement Calculation</div>
        <table class="calculation-table">
            <thead>
                <tr>
                    <th>Description</th>
                    <th class="amount">Amount (SAR)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Unpaid Salary</td>
                    <td class="amount">' . number_format($finalSettlement->unpaid_salary, 2) . '</td>
                </tr>
                <tr>
                    <td>Unpaid Overtime</td>
                    <td class="amount">' . number_format($finalSettlement->unpaid_overtime, 2) . '</td>
                </tr>
                <tr>
                    <td>Leave Encashment (' . ($employee->leave_balance ?? 0) . ' days)</td>
                    <td class="amount">' . number_format($finalSettlement->leave_encashment, 2) . '</td>
                </tr>
                <tr>
                    <td>End of Service Gratuity</td>
                    <td class="amount">' . number_format($finalSettlement->gratuity, 2) . '</td>
                </tr>';

        if ($finalSettlement->deductions > 0) {
            $html .= '<tr>
                    <td>Total Deductions</td>
                    <td class="amount">(' . number_format($finalSettlement->deductions, 2) . ')</td>
                </tr>';
        }

        $html .= '<tr class="total-row">
                    <td><strong>TOTAL PAYABLE</strong></td>
                    <td class="amount"><strong>' . number_format($finalSettlement->total_payable, 2) . '</strong></td>
                </tr>
            </tbody>
        </table>
    </div>';

        if ($finalSettlement->deductions_list && count($finalSettlement->deductions_list) > 0) {
            $html .= '<div class="section">
                <div class="section-title">Deduction Details</div>
                <table class="calculation-table">
                    <thead>
                        <tr>
                            <th>Type</th>
                            <th>Description</th>
                            <th class="amount">Amount (SAR)</th>
                        </tr>
                    </thead>
                    <tbody>';
            
            foreach ($finalSettlement->deductions_list as $deduction) {
                $html .= '<tr>
                        <td>' . $deduction['type'] . '</td>
                        <td>' . $deduction['description'] . '</td>
                        <td class="amount">' . number_format($deduction['amount'], 2) . '</td>
                    </tr>';
            }
            
            $html .= '</tbody>
                </table>
            </div>';
        }

        if ($finalSettlement->notes) {
            $html .= '<div class="section">
                <div class="section-title">Notes</div>
                <p>' . nl2br(htmlspecialchars($finalSettlement->notes)) . '</p>
            </div>';
        }

        if ($finalSettlement->agreement_terms) {
            $html .= '<div class="section">
                <div class="section-title">Agreement Terms</div>
                <p>' . nl2br(htmlspecialchars($finalSettlement->agreement_terms)) . '</p>
            </div>';
        }

        $html .= '<div class="section">
        <div class="section-title">Settlement Timeline</div>
        <table class="info-table">
            <tr>
                <td class="label">Created On:</td>
                <td>' . $finalSettlement->created_at->format('d/m/Y H:i') . '</td>
            </tr>';

        if ($finalSettlement->approved_by) {
            $html .= '<tr>
                <td class="label">Approved By:</td>
                <td>' . $finalSettlement->approved_by->name . '</td>
            </tr>
            <tr>
                <td class="label">Approved On:</td>
                <td>' . ($finalSettlement->approved_at ? Carbon::parse($finalSettlement->approved_at)->format('d/m/Y H:i') : 'N/A') . '</td>
            </tr>';
        }

        if ($finalSettlement->completed_at) {
            $html .= '<tr>
                <td class="label">Completed On:</td>
                <td>' . Carbon::parse($finalSettlement->completed_at)->format('d/m/Y H:i') . '</td>
            </tr>';
        }

        $html .= '</table>
    </div>

    <div class="footer">
        <div class="signature-section">
            <div class="signature-box">
                <div class="signature-line">Employee Signature</div>
                <div style="margin-top: 10px;">Date: ___________</div>
            </div>
            <div class="signature-box">
                <div class="signature-line">HR Manager Signature</div>
                <div style="margin-top: 10px;">Date: ___________</div>
            </div>
            <div class="signature-box">
                <div class="signature-line">Finance Manager Signature</div>
                <div style="margin-top: 10px;">Date: ___________</div>
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #666;">
            This document is computer generated and does not require a signature.
        </div>
    </div>
</body>
</html>';

        return $html;
    }

    /**
     * Calculate leave encashment for employee
     */
    private function calculateLeaveEncashment($employee)
    {
        // Get employee's leave balance
        $leaveBalance = $employee->leave_balance ?? 0;
        
        if ($leaveBalance <= 0) {
            return 0;
        }

        // Get company policy for maximum encashable days (default 30 days)
        $maxEncashableDays = config('payroll.max_encashable_leave_days', 30);
        $encashableDays = min($leaveBalance, $maxEncashableDays);

        // Calculate daily rate based on basic salary
        $basicSalary = $employee->base_salary ?? 0;
        $dailyRate = $basicSalary / 30; // Assuming 30 days per month

        // Calculate encashment amount
        $encashmentAmount = $encashableDays * $dailyRate;

        // Apply any policy restrictions
        $minServiceMonths = config('payroll.min_service_months_for_encashment', 12);
        $serviceMonths = $employee->hire_date ? 
            Carbon::parse($employee->hire_date)->diffInMonths(now()) : 0;

        if ($serviceMonths < 12) {
            // Reduce encashment for employees with less than 1 year service
            $encashmentAmount *= 0.5; // 50% for employees with less than 1 year service
        }

        return round($encashmentAmount, 2);
    }
}


