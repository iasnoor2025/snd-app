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
                ->latest('payroll_month')
                ->first();

            $unpaidSalary = 0;
            if ($lastPaidPayroll) {
                $unpaidMonths = Carbon::parse($lastPaidPayroll->payroll_month)
                    ->diffInMonths(Carbon::parse($request->settlement_date));

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

    private function calculateLeaveEncashment($employee)
    {
        // TODO: Implement leave encashment calculation based on company policy
        return 0;
    }
}


