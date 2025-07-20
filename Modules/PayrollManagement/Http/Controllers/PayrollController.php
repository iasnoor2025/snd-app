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

        $perPage = $request->get('per_page', 10);

        // Debug: Log the per_page parameter
        \Log::info('Payroll index - per_page parameter', [
            'requested_per_page' => $request->get('per_page'),
            'default_per_page' => 10,
            'final_per_page' => $perPage,
            'all_request_params' => $request->all()
        ]);

        $payrolls = $query->latest()->paginate($perPage);

        // Ensure employee data is properly loaded and formatted
        $payrolls->getCollection()->transform(function ($payroll) {
            if ($payroll->employee) {
                $payroll->employee->append('name');
            }
            return $payroll;
        });
        $employees = Employee::where('status', 'active')
            ->get(['id', 'first_name', 'middle_name', 'last_name', 'file_number'])
            ->append('name')
            ->filter(function ($employee) {
                return !empty($employee->id) && !empty($employee->name);
            })
            ->values();

                // Add per_page to the pagination data
        $payrollsArray = $payrolls->toArray();
        $payrollsArray['per_page'] = $perPage;

        // Debug: Log the response data
        \Log::info('Payroll index - response data', [
            'payrolls_meta' => $payrollsArray,
            'filters' => $request->only(['month', 'status', 'employee_id', 'per_page']),
            'total_records' => $payrolls->total(),
            'per_page' => $perPage
        ]);

        return Inertia::render('Payroll/Index', [
            'payrolls' => $payrollsArray,
            'employees' => $employees,
            'filters' => $request->only(['month', 'status', 'employee_id', 'per_page']),
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

        // Check if employee has manager-approved timesheets for the month
        $hasApprovedTimesheets = $this->payrollService->hasManagerApprovedTimesheets($employee, $month);

        if (!$hasApprovedTimesheets) {
            return back()->with('error', "No manager-approved timesheets found for {$employee->name} for {$month->format('F Y')}. Payroll generation requires manager-approved timesheets.");
        }

        $payroll = $this->payrollService->generatePayroll($month, $employee);

        return redirect()->route('payroll.show', $payroll)
            ->with('success', 'Payroll generated successfully based on manager-approved timesheets.');
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
        // Debug: Log that we reached the controller
        \Log::info('GenerateMonthlyPayroll controller method reached', [
            'headers' => $request->headers->all(),
            'user' => auth()->user() ? auth()->user()->id : 'not logged in',
            'method' => $request->method(),
            'url' => $request->url()
        ]);

        $request->validate([
            'month' => 'required|date'
        ]);

        try {
            DB::beginTransaction();

            $month = Carbon::parse($request->month);

            // Get active employees
            $employees = Employee::where('status', 'active')->get();
            $employeesWithApprovedTimesheets = 0;
            $generatedPayrolls = [];
            $errors = [];

            foreach ($employees as $employee) {
                try {
                    // Check if employee has manager-approved timesheets
                    if ($this->payrollService->hasManagerApprovedTimesheets($employee, $month)) {
                        $employeesWithApprovedTimesheets++;

                        // Generate payroll for this employee
                        $payroll = $this->payrollService->generatePayroll($month, $employee);
                        $generatedPayrolls[] = $payroll;
                    }
                } catch (\Exception $e) {
                    $errors[] = "Error processing {$employee->name}: {$e->getMessage()}";
                    \Log::error("Error generating payroll for employee {$employee->name}", [
                        'error' => $e->getMessage(),
                        'employee_id' => $employee->id,
                        'month' => $month->format('Y-m')
                    ]);
                }
            }

            // Create payroll run record
            $payrollRun = PayrollRun::create([
                'batch_id' => 'BATCH_' . time(),
                'run_date' => $month,
                'status' => 'pending',
                'run_by' => auth()->id() ?? 1,
                'total_employees' => $employeesWithApprovedTimesheets,
                'notes' => 'Monthly payroll run for ' . $month->format('F Y')
            ]);

            DB::commit();

            $message = "Payroll run initiated successfully. {$employeesWithApprovedTimesheets} employees have manager-approved timesheets for {$month->format('F Y')}.";

            if (count($errors) > 0) {
                $message .= " Some errors occurred: " . implode(', ', $errors);
            }

            // Return JSON response for fetch request
            return response()->json([
                'success' => true,
                'message' => $message,
                'payroll_run_id' => $payrollRun->id,
                'employees_processed' => $employeesWithApprovedTimesheets,
                'payrolls_generated' => count($generatedPayrolls),
                'errors' => $errors
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Payroll generation error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to run payroll: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display a payroll run
     */
    public function showPayrollRun(PayrollRun $payrollRun)
    {
        $this->authorize('viewAny', Payroll::class);

        $payrolls = Payroll::where('month', $payrollRun->run_date->month)
            ->where('year', $payrollRun->run_date->year)
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
        $payroll = \Modules\PayrollManagement\Domain\Models\Payroll::with(['employee', 'employee.department', 'employee.designation'])->findOrFail($payrollId);

        if (!$payroll->employee) {
            abort(404, 'Employee not found for this payroll');
        }

        $pdf = $payslipService->generatePayslip($payroll);
        return response($pdf, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="payslip_{$payroll->employee->id}_{$payroll->id}.pdf"',
        ]);
    }

    public function viewPayslip($payrollId)
    {
        $payroll = \Modules\PayrollManagement\Domain\Models\Payroll::with(['employee', 'employee.department', 'employee.designation', 'items'])->findOrFail($payrollId);

        if (!$payroll->employee) {
            abort(404, 'Employee not found for this payroll');
        }

        // Get attendance data for the payroll month
        $month = Carbon::createFromDate($payroll->year, $payroll->month, 1);
        $startDate = $month->copy()->startOfMonth();
        $endDate = $month->copy()->endOfMonth();

        // Get timesheets for the employee in this month
        $timesheets = \Modules\TimesheetManagement\Domain\Models\Timesheet::where('employee_id', $payroll->employee_id)
            ->whereBetween('date', [$startDate, $endDate])
            ->orderBy('date')
            ->get();



        // Generate attendance calendar data
        $attendanceData = $this->generateAttendanceCalendar($timesheets, $startDate, $endDate);





        return Inertia::render('Payroll/Payslip', [
            'payroll' => $payroll,
            'employee' => $payroll->employee,
            'attendanceData' => $attendanceData,
        ]);
    }

        /**
     * Generate attendance calendar data for payslip
     */
    private function generateAttendanceCalendar($timesheets, $startDate, $endDate)
    {
        $calendar = [];
        $daysInMonth = $endDate->day;



        // Create calendar structure for all days in the month
        for ($day = 1; $day <= $daysInMonth; $day++) {
            $date = $startDate->copy()->setDay($day);
            $dateStr = $date->format('Y-m-d');

                        // Get timesheet for this day - use more robust matching
            $timesheet = $timesheets->first(function($t) use ($dateStr) {
                return $t->date->format('Y-m-d') === $dateStr;
            });



            $status = $this->getAttendanceStatus($timesheet, $date);
            $regularHours = $timesheet ? $timesheet->hours_worked : 0;
            $overtimeHours = $timesheet ? $timesheet->overtime_hours : 0;
            $totalHours = $regularHours + $overtimeHours;



            $calendar[$day] = [
                'date' => $dateStr,
                'day_of_week' => $date->dayOfWeek,
                'day_name' => $date->format('D'),
                'regular_hours' => $regularHours,
                'overtime_hours' => $overtimeHours,
                'status' => $status,
                'total_hours' => $totalHours,
            ];
        }

        return $calendar;
    }

    /**
     * Get attendance status for a day
     */
    private function getAttendanceStatus($timesheet, $date)
    {
        // Check if it's Friday (weekend)
        if ($date->format('D') === 'Fri') {
            return 'F'; // Friday (weekend)
        }

        // Check if employee worked
        if ($timesheet && ($timesheet->hours_worked > 0 || $timesheet->overtime_hours > 0)) {
            $totalHours = $timesheet->hours_worked + $timesheet->overtime_hours;

            if ($totalHours > 8) {
                return 'O'; // Overtime
            } else {
                return '8'; // Regular hours
            }
        }

        return 'A'; // Absent
    }

    /**
     * Bulk delete payrolls (admin only)
     */
    public function bulkDelete(Request $request)
    {
        // Check if user is admin
        if (!auth()->user()->hasRole('admin')) {
            abort(403, 'Only administrators can perform bulk delete operations.');
        }

        $request->validate([
            'payroll_ids' => 'required|array',
            'payroll_ids.*' => 'exists:payrolls,id'
        ]);

        try {
            DB::beginTransaction();

            $payrollIds = $request->payroll_ids;
            $deletedCount = 0;

            foreach ($payrollIds as $payrollId) {
                $payroll = Payroll::find($payrollId);

                if ($payroll && $payroll->status !== 'paid') {
                    // Delete associated items first
                    $payroll->items()->delete();

                    // Soft delete the payroll
                    $payroll->delete();
                    $deletedCount++;
                }
            }

            DB::commit();

            $message = $deletedCount > 0
                ? "Successfully deleted {$deletedCount} payroll record(s)."
                : "No payroll records were deleted (only unpaid payrolls can be deleted).";

            return back()->with('success', $message);

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to delete payroll records: ' . $e->getMessage());
        }
    }

    /**
     * Generate payroll for all months that need it
     * This method checks for approved timesheets and skips months that already have payroll
     */
    public function generatePayrollForAllMonths(Request $request)
    {
        $this->authorize('create', Payroll::class);

        $request->validate([
            'employee_id' => 'nullable|exists:employees,id',
            'start_month' => 'nullable|date_format:Y-m',
            'end_month' => 'nullable|date_format:Y-m',
        ]);

        try {
            DB::beginTransaction();

            $employee = $request->employee_id ? Employee::findOrFail($request->employee_id) : null;
            $startMonth = $request->start_month;
            $endMonth = $request->end_month;

            $result = $this->payrollService->generatePayrollForAllMonths($employee, $startMonth, $endMonth);

            // Create payroll run record
            $payrollRun = PayrollRun::create([
                'batch_id' => 'BATCH_ALL_' . time(),
                'run_date' => Carbon::now(),
                'status' => 'pending',
                'run_by' => auth()->id() ?? 1,
                'total_employees' => count($result['processed_employees']),
                'notes' => 'Multi-month payroll run - Generated: ' . $result['total_generated'] . ', Skipped: ' . $result['total_skipped']
            ]);

            DB::commit();

            $message = "Payroll generation completed successfully.\n";
            $message .= "Generated: {$result['total_generated']} payrolls\n";
            $message .= "Skipped: {$result['total_skipped']} months (already exists or no approved timesheets)\n";
            $message .= "Errors: {$result['total_errors']}";

            if (count($result['processed_employees']) > 0) {
                $message .= "\n\nProcessed employees: " . implode(', ', $result['processed_employees']);
            }

            if (count($result['errors']) > 0) {
                $message .= "\n\nErrors: " . implode(', ', array_slice($result['errors'], 0, 5));
                if (count($result['errors']) > 5) {
                    $message .= " and " . (count($result['errors']) - 5) . " more...";
                }
            }

            return response()->json([
                'success' => $result['success'],
                'message' => $message,
                'data' => $result,
                'payroll_run_id' => $payrollRun->id
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Multi-month payroll generation error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to generate payroll for all months: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get months that need payroll generation for an employee
     */
    public function getMonthsNeedingPayroll(Request $request)
    {
        $this->authorize('view', Payroll::class);

        $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'start_month' => 'nullable|date_format:Y-m',
            'end_month' => 'nullable|date_format:Y-m',
        ]);

        try {
            $employee = Employee::findOrFail($request->employee_id);
            $startMonth = $request->start_month;
            $endMonth = $request->end_month;

            $months = $this->payrollService->getMonthsNeedingPayroll($employee, $startMonth, $endMonth);

            return response()->json([
                'success' => true,
                'data' => $months,
                'employee' => [
                    'id' => $employee->id,
                    'name' => $employee->full_name,
                    'employee_id' => $employee->employee_id
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Error getting months needing payroll: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to get months needing payroll: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate payroll for all employees with approved timesheets
     */
    public function generatePayrollForApprovedTimesheets()
    {
        $this->authorize('create', Payroll::class);

        try {
            DB::beginTransaction();

            $result = $this->payrollService->generatePayrollForApprovedTimesheets();

            // Create payroll run record
            $payrollRun = PayrollRun::create([
                'batch_id' => 'BATCH_APPROVED_' . time(),
                'run_date' => Carbon::now(),
                'status' => 'pending',
                'run_by' => auth()->id() ?? 1,
                'total_employees' => $result['total_processed_employees'],
                'notes' => 'Payroll generation for employees with approved timesheets - Generated: ' . $result['total_generated']
            ]);

            DB::commit();

            $message = "Payroll generation completed successfully.\n";
            $message .= "Generated: {$result['total_generated']} payrolls\n";
            $message .= "Processed employees: {$result['total_processed_employees']}\n";
            $message .= "Skipped employees: {$result['total_skipped_employees']}\n";
            $message .= "Errors: {$result['total_errors']}";

            if (count($result['processed_employees']) > 0) {
                $message .= "\n\nProcessed: " . implode(', ', $result['processed_employees']);
            }

            if (count($result['errors']) > 0) {
                $message .= "\n\nErrors: " . implode(', ', array_slice($result['errors'], 0, 5));
                if (count($result['errors']) > 5) {
                    $message .= " and " . (count($result['errors']) - 5) . " more...";
                }
            }

            return response()->json([
                'success' => $result['success'],
                'message' => $message,
                'data' => $result,
                'payroll_run_id' => $payrollRun->id
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Payroll generation for approved timesheets error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to generate payroll: ' . $e->getMessage()
            ], 500);
        }
    }
}


