<?php

namespace Modules\PayrollManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use Modules\EmployeeManagement\Domain\Models\Employee;
use Modules\PayrollManagement\Domain\Models\Payroll;
use Modules\PayrollManagement\Domain\Models\PayrollItem;
use Modules\PayrollManagement\Domain\Models\PayrollRun;
use Modules\PayrollManagement\Services\PayrollService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Modules\Core\Domain\Models\User;
use Modules\PayrollManagement\Services\BankIntegrationService;
use Modules\PayrollManagement\Services\PayslipService;

class PayrollController extends Controller
{
    protected $payrollService;

    public function __construct(PayrollService $payrollService)
    {
        $this->payrollService = $payrollService;
        $this->middleware(['auth', 'verified']);
    }

    /**
     * Display a listing of payrolls
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Payroll::class);

        $query = Payroll::with(['employee', 'approver', 'payer']);

        if ($request->month) {
            $date = Carbon::parse($request->month);
            $query->where(function($q) use ($date) {
                $q->where('month', $date->month)
                  ->where('year', $date->year);
            });
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->employee_id) {
            $query->where('employee_id', $request->employee_id);
        }

        $payrolls = $query->latest()->paginate(10);

        // Ensure employee data is properly loaded and formatted
        $payrolls->getCollection()->transform(function ($payroll) {
            if ($payroll->employee) {
                $payroll->employee->append('name');
            }
            return $payroll;
        });
        $employees = Employee::where('status', 'active')
            ->get(['id', 'first_name', 'middle_name', 'last_name'])
            ->append('name')
            ->filter(function ($employee) {
                return !empty($employee->id) && !empty($employee->name);
            })
            ->values();

        return Inertia::render('Payroll/Index', [
            'payrolls' => $payrolls,
            'employees' => $employees,
            'filters' => $request->only(['month', 'status', 'employee_id']),
            'hasRecords' => $payrolls->total() > 0
        ]);
    }

    /**
     * Show the form for creating a new payroll
     */
    public function create()
    {
        $this->authorize('create', Payroll::class);

        $employees = Employee::active()->get();
        $currentMonth = Carbon::now()->format('Y-m');

        return Inertia::render('Payroll/Create', [
            'employees' => $employees,
            'currentMonth' => $currentMonth,
        ]);
    }

    /**
     * Store a newly created payroll
     */
    public function store(Request $request)
    {
        $this->authorize('create', Payroll::class);

        $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'month' => 'required|date_format:Y-m',
        ]);

        $employee = Employee::findOrFail($request->employee_id);
        $month = Carbon::parse($request->month);

        $payroll = $this->payrollService->generatePayroll($month, $employee);

        return redirect()->route('payroll.show', $payroll)
            ->with('success', 'Payroll generated successfully.');
    }

    /**
     * Display the specified payroll
     */
    public function show(Payroll $payroll)
    {
        $this->authorize('view', $payroll);
        $payroll->load(['employee', 'items', 'approver', 'payer']);
        return Inertia::render('Payroll/Show', [
            'payroll' => $payroll,
            'employee' => $payroll->employee,
            'items' => $payroll->items,
            'approver' => $payroll->approver,
            'payer' => $payroll->payer,
            'created_at' => $payroll->created_at,
            'updated_at' => $payroll->updated_at,
            'deleted_at' => $payroll->deleted_at,
        ]);
    }

    /**
     * Show the form for editing the specified payroll
     */
    public function edit(Payroll $payroll)
    {
        $this->authorize('update', $payroll);
        $payroll->load(['employee', 'items']);
        $employees = Employee::active()->get();
        return Inertia::render('Payroll/Edit', [
            'payroll' => $payroll,
            'employee' => $payroll->employee,
            'items' => $payroll->items,
            'employees' => $employees,
            'created_at' => $payroll->created_at,
            'updated_at' => $payroll->updated_at,
            'deleted_at' => $payroll->deleted_at,
        ]);
    }

    /**
     * Update the specified payroll
     */
    public function update(Request $request, Payroll $payroll)
    {
        $this->authorize('update', $payroll);

        $request->validate([
            'items' => 'sometimes|array',
            'items.*.type' => 'required_with:items|in:earning,deduction',
            'items.*.description' => 'required_with:items|string',
            'items.*.amount' => 'required_with:items|numeric|min:0',
        ]);

        if ($request->has('items')) {
            // Update payroll items
            $payroll->items()->delete();

            foreach ($request->items as $item) {
                $payroll->items()->create([
                    'type' => $item['type'],
                    'description' => $item['description'],
                    'amount' => $item['amount'],
                ]);
            }

            // Recalculate totals
            $payroll->calculateTotals();
            $payroll->save();
        }

        return redirect()->route('payroll.show', $payroll)
            ->with('success', 'Payroll updated successfully.');
    }

    /**
     * Approve the specified payroll
     */
    public function approve(Payroll $payroll)
    {
        $this->authorize('approve', $payroll);

        $this->payrollService->approvePayroll($payroll, auth()->id());

        return back()->with('success', 'Payroll approved successfully.');
    }

    /**
     * Process payment for the specified payroll
     */
    public function processPayment(Request $request, Payroll $payroll)
    {
        $this->authorize('process', $payroll);

        $request->validate([
            'payment_method' => 'required|string',
            'reference' => 'nullable|string',
        ]);

        $this->payrollService->processPayment(
            $payroll,
            $request->payment_method,
            $request->reference,
            auth()->id()
        );

        return back()->with('success', 'Payment processed successfully.');
    }

    /**
     * Cancel the specified payroll
     */
    public function cancel(Payroll $payroll)
    {
        $this->authorize('delete', $payroll);

        $payroll->cancel();

        return back()->with('success', 'Payroll cancelled successfully.');
    }

    /**
     * Generate monthly payroll for all employees
     */
    public function generateMonthlyPayroll(Request $request)
    {
        $this->authorize('create', Payroll::class);

        $request->validate([
            'month' => 'required|date'
        ]);

        try {
            DB::beginTransaction();

            $month = Carbon::parse($request->month);
            $payrollRun = $this->payrollService->runPayrollForMonth($month, auth()->id());

            DB::commit();

            return redirect()->route('payroll.runs.show', $payrollRun)
                ->with('success', 'Payroll run initiated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to run payroll: ' . $e->getMessage());
        }
    }

    /**
     * Display a payroll run
     */
    public function showPayrollRun(PayrollRun $payrollRun)
    {
        $this->authorize('viewAny', Payroll::class);

        $payrolls = Payroll::where('month', $payrollRun->run_date)
            ->with(['employee', 'items'])
            ->get();

        return Inertia::render('Payroll/Run', [
            'payrollRun' => $payrollRun,
            'payrolls' => $payrolls,
        ]);
    }

    /**
     * Approve a payroll run
     */
    public function approvePayrollRun(PayrollRun $payrollRun)
    {
        $this->authorize('approve', Payroll::class);

        try {
            $this->payrollService->approvePayrollRun($payrollRun);
            return back()->with('success', 'Payroll run approved successfully.');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to approve payroll run: ' . $e->getMessage());
        }
    }

    /**
     * Reject a payroll run
     */
    public function rejectPayrollRun(Request $request, PayrollRun $payrollRun)
    {
        $this->authorize('approve', Payroll::class);

        $request->validate([
            'notes' => 'required|string'
        ]);

        try {
            $this->payrollService->rejectPayrollRun($payrollRun, $request->notes);
            return back()->with('success', 'Payroll run rejected successfully.');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to reject payroll run: ' . $e->getMessage());
        }
    }

    public function exportBankFile(Request $request, BankIntegrationService $bankIntegrationService)
    {
        $payrollIds = $request->input('payroll_ids', []);
        $payrolls = \Modules\PayrollManagement\Domain\Models\Payroll::with('employee')->whereIn('id', $payrollIds)->get();
        $csv = $bankIntegrationService->exportPayrollBankFile($payrolls->all());
        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="payroll_bank_file.csv"',
        ]);
    }

    public function downloadPayslip($payrollId, PayslipService $payslipService)
    {
        $payroll = \Modules\PayrollManagement\Domain\Models\Payroll::with('employee')->findOrFail($payrollId);
        $pdf = $payslipService->generatePayslip($payroll);
        return response($pdf, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="payslip_{$payroll->employee->id}_{$payroll->id}.pdf"',
        ]);
    }
}


