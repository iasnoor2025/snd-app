<?php

namespace Modules\Payroll\Http\Controllers;

use App\Http\Controllers\Controller;
use Modules\Payroll\Domain\Models\AdvancePayment;
use Modules\Payroll\Domain\Models\AdvancePaymentHistory;
use Modules\EmployeeManagement\Domain\Models\Employee;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AdvancePaymentController extends Controller
{
    /**
     * Display a listing of all advance payments across all employees.
     */
    public function allAdvances()
    {
        $advancePayments = AdvancePayment::with(['employee', 'approver', 'rejecter'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Payroll/Advances/Index', [
            'advances' => [
                'data' => $advancePayments->map(function ($payment) {
                    return [
                        'id' => $payment->id,
                        'employee' => [
                            'id' => $payment->employee->id,
                            'first_name' => $payment->employee->first_name,
                            'last_name' => $payment->employee->last_name,
                            'employee_id' => $payment->employee->employee_id,
                        ],
                        'amount' => $payment->amount,
                        'reason' => $payment->reason,
                        'status' => $payment->status,
                        'created_at' => $payment->created_at,
                        'rejection_reason' => $payment->rejection_reason,
                        'repayment_date' => $payment->repayment_date,
                        'type' => 'advance_payment'
                    ];
                }),
                'current_page' => 1,
                'last_page' => 1,
                'per_page' => 10,
                'total' => $advancePayments->count()
            ],
            'total_balance' => 0,
        ]);
    }

    /**
     * Display a listing of advance payments for a specific employee.
     */
    public function index(Employee $employee)
    {
        $advancePayments = $employee->advancePayments()
            ->with(['approver', 'rejecter'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Payroll/Advances/Index', [
            'employee' => $employee,
            'advances' => [
                'data' => $advancePayments->map(function ($payment) {
                    return [
                        'id' => $payment->id,
                        'amount' => $payment->amount,
                        'reason' => $payment->reason,
                        'status' => $payment->status,
                        'created_at' => $payment->created_at,
                        'rejection_reason' => $payment->rejection_reason,
                        'repayment_date' => $payment->repayment_date,
                        'type' => 'advance_payment'
                    ];
                }),
                'current_page' => 1,
                'last_page' => 1,
                'per_page' => 10,
                'total' => $advancePayments->count()
            ],
            'total_balance' => $employee->total_advance_balance,
        ]);
    }

    /**
     * Store a newly created advance payment.
     */
    public function store(Request $request, Employee $employee)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0',
            'monthly_deduction' => 'required|numeric|min:0',
            'reason' => 'required|string|max:255',
            'payment_date' => 'required|date',
            'estimated_months' => 'required|integer|min:1',
        ]);

        try {
            $advancePayment = $employee->advancePayments()->create([
                'amount' => $request->amount,
                'reason' => $request->reason,
                'payment_date' => $request->payment_date,
                'monthly_deduction' => $request->monthly_deduction,
                'estimated_months' => $request->estimated_months,
                'status' => 'pending',
                'repaid_amount' => 0,
            ]);

            // Update the employee's advance_payment field for backward compatibility
            $employee->advance_payment = $employee->total_advance_balance;
            $employee->save();

            return redirect()->back()->with('success', 'Advance payment recorded successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Failed to process advance request: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified advance payment.
     */
    public function show(Employee $employee, AdvancePayment $advance)
    {
        return Inertia::render('Payroll/Advances/Show', [
            'employee' => $employee,
            'advance' => $advance->load(['approver', 'rejecter'])
        ]);
    }

    /**
     * Record a repayment against an advance.
     */
    public function recordRepayment(Request $request, $advance)
    {
        try {
            // Find the advance payment
            $advancePayment = AdvancePayment::findOrFail($advance);

            Log::info('Processing repayment request', [
                'advance_id' => $advancePayment->id,
                'amount' => $request->amount,
                'remaining_balance' => $advancePayment->remaining_balance,
                'monthly_deduction' => $advancePayment->monthly_deduction,
                'status' => $advancePayment->status,
                'request_data' => $request->all()
            ]);

            // Get all active advances for this employee, ordered by remaining balance (lowest first)
            $activeAdvances = AdvancePayment::where('employee_id', $advancePayment->employee_id)
                ->whereIn('status', ['approved', 'partially_repaid'])
                ->orderByRaw('(amount - repaid_amount) asc')
                ->get();

            Log::info('Found active advances', [
                'count' => $activeAdvances->count(),
                'advances' => $activeAdvances->map(function($advance) {
                    return [
                        'id' => $advance->id,
                        'amount' => $advance->amount,
                        'repaid_amount' => $advance->repaid_amount,
                        'remaining_balance' => $advance->remaining_balance,
                        'status' => $advance->status
                    ];
                })
            ]);

            // Calculate total remaining balance and monthly deduction
            $totalRemainingBalance = $activeAdvances->sum(function ($advance) {
                return $advance->remaining_balance;
            });

            $totalMonthlyDeduction = $activeAdvances->sum(function ($advance) {
                return $advance->monthly_deduction;
            });

            Log::info('Calculated totals', [
                'total_remaining_balance' => $totalRemainingBalance,
                'total_monthly_deduction' => $totalMonthlyDeduction
            ]);

            // Validate the total amount
            $request->validate([
                'amount' => [
                    'required',
                    'numeric',
                    function ($attribute, $value, $fail) use ($totalRemainingBalance, $totalMonthlyDeduction) {
                        if ($value < $totalMonthlyDeduction) {
                            $fail("The repayment amount must be at least the total monthly deduction of SAR {$totalMonthlyDeduction}.");
                            return;
                        }

                        if ($value > $totalRemainingBalance) {
                            $fail("The repayment amount cannot exceed the total remaining balance of SAR {$totalRemainingBalance}.");
                            return;
                        }
                    }
                ],
                'payment_date' => 'required|date',
                'notes' => 'nullable|string|max:500',
            ]);

            // Process the repayment
            DB::beginTransaction();

            $remainingRepaymentAmount = $request->amount;
            $employeeId = $advancePayment->employee_id;
            $paymentDate = $request->payment_date;
            $notes = $request->notes ?? 'Payment recorded manually';

            // Distribute repayment across advances (smallest balance first)
            foreach ($activeAdvances as $advance) {
                if ($remainingRepaymentAmount <= 0) {
                    break;
                }

                $amountForThisAdvance = min($remainingRepaymentAmount, $advance->remaining_balance);

                // Update the advance payment
                $advance->repaid_amount += $amountForThisAdvance;

                if ($advance->repaid_amount >= $advance->amount) {
                    $advance->status = 'fully_repaid';
                } else if ($advance->repaid_amount > 0) {
                    $advance->status = 'partially_repaid';
                }

                $advance->save();

                // Create a payment history record for tracking
                AdvancePaymentHistory::create([
                    'employee_id' => $employeeId,
                    'advance_payment_id' => $advance->id,
                    'amount' => $amountForThisAdvance,
                    'payment_date' => $paymentDate,
                    'notes' => $notes,
                    'recorded_by' => Auth::id(),
                ]);

                $remainingRepaymentAmount -= $amountForThisAdvance;
            }

            // Update the employee's advance_payment field for backward compatibility
            // Ensure ID is numeric
        if (!is_numeric($employeeId)) {
            abort(404, 'Invalid ID provided');
        }
        // Ensure ID is numeric
        if (!is_numeric($employeeId)) {
            abort(404, 'Invalid ID provided');
        }
        $employee = Employee::find($employeeId);
            $employee->advance_payment = $employee->total_advance_balance;
            $employee->save();

            DB::commit();

            // Return a success response
            return response()->json([
                'success' => true,
                'message' => 'Repayment recorded successfully',
                'new_balance' => $employee->total_advance_balance
            ]);
        } catch (\Exception $e) {
            Log::error('Error processing repayment: ' . $e->getMessage(), [
                'advance_id' => $advance ?? null,
                'amount' => $request->amount ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to process repayment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get monthly history for an employee
     */
    private function getMonthlyHistory(Employee $employee)
    {
        $showOnlyLast = request()->input('showOnlyLast', false);
        $perPage = $showOnlyLast ? 1 : 10;
        $page = request()->input('page', 1);

        $paymentHistory = AdvancePaymentHistory::where('employee_id', $employee->id)
            ->with(['advancePayment', 'recorder'])
            ->orderBy('payment_date', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);

        return $paymentHistory->groupBy(function($item) {;
            return $item->payment_date->format('Y-m');
        })->map(function($group) {
            return [
                'month' => $group->first()->payment_date->format('F Y'),
                'total_amount' => $group->sum('amount'),
                'payments' => $group->map(function($payment) {
                    return [
                        'id' => $payment->id,
                        'amount' => $payment->amount,
                        'payment_date' => $payment->payment_date->format('Y-m-d'),
                        'notes' => $payment->notes,
                        'recorded_by' => $payment->recorder ? $payment->recorder->name : 'System',
                        'advance_payment_id' => $payment->advance_payment_id,
                    ];
                })->values(),
            ];
        })->values();
    }

    /**
     * Get all advances for an employee
     */
    public function getEmployeeAdvances(Employee $employee)
    {
        return response()->json([
            'advances' => $employee->advancePayments()
                ->orderBy('created_at', 'desc')
                ->get()
        ]);
    }

    /**
     * Approve an advance payment request
     */
    public function approve(Employee $employee, AdvancePayment $advance)
    {
        if ($advance->status !== 'pending') {
            return back()->withErrors(['error' => 'This advance payment request cannot be approved.']);
        }

        $advance->status = 'approved';
        $advance->approved_by = Auth::id();
        $advance->approved_at = now();
        $advance->save();

        return back()->with('success', 'Advance payment request approved successfully.');
    }

    /**
     * Reject an advance payment request
     */
    public function reject(Request $request, AdvancePayment $advancePayment)
    {
        if ($advancePayment->status !== 'pending') {
            return back()->withErrors(['error' => 'This advance payment request cannot be rejected.']);
        }

        $validated = $request->validate([
            'rejection_reason' => 'required|string|max:255'
        ]);

        $advancePayment->status = 'rejected';
        $advancePayment->rejected_by = Auth::id();
        $advancePayment->rejected_at = now();
        $advancePayment->rejection_reason = $validated['rejection_reason'];
        $advancePayment->save();

        return back()->with('success', 'Advance payment request rejected successfully.');
    }

    /**
     * Show edit form for an advance
     */
    public function edit(Employee $employee, AdvancePayment $advance)
    {
        return Inertia::render('Payroll/Advances/Edit', [
            'employee' => $employee,
            'advance' => $advance,
        ]);
    }

    /**
     * Update an advance payment
     */
    public function update(Request $request, Employee $employee, AdvancePayment $advance)
    {
        if ($advance->status !== 'pending' && !Auth::user()->hasRole('admin')) {
            return back()->withErrors(['error' => 'This advance payment request cannot be updated.']);
        }

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'monthly_deduction' => 'required|numeric|min:0',
            'reason' => 'required|string|max:255',
            'payment_date' => 'required|date',
            'estimated_months' => 'required|integer|min:1',
        ]);

        $advance->update($validated);

        return redirect()->route('payroll.employees.advances.show', [$employee->id, $advance->id])
            ->with('success', 'Advance payment updated successfully.');
    }

    /**
     * Delete an advance payment
     */
    public function destroy(Employee $employee, AdvancePayment $advance)
    {
        if ($advance->status !== 'pending' && !Auth::user()->hasRole('admin')) {
            return back()->withErrors(['error' => 'This advance payment request cannot be deleted.']);
        }

        if ($advance->repaid_amount > 0) {
            return back()->withErrors(['error' => 'This advance payment has repayments recorded against it and cannot be deleted.']);
        }

        DB::beginTransaction();
        try {
            // Delete associated histories
            AdvancePaymentHistory::where('advance_payment_id', $advance->id)->delete();

            // Delete the advance
            $advance->delete();

            // Update employee balance
            $employee->advance_payment = $employee->total_advance_balance;
            $employee->save();

            DB::commit();

            return redirect()->route('payroll.employees.advances.index', $employee->id)
                ->with('success', 'Advance payment deleted successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to delete advance payment: ' . $e->getMessage()]);
        }
    }

    /**
     * Update monthly deduction for multiple advances
     */
    public function updateMonthlyDeduction(Request $request, Employee $employee)
    {
        $validated = $request->validate([
            'advances' => 'required|array',
            'advances.*.id' => 'required|exists:advance_payments,id',
            'advances.*.monthly_deduction' => 'required|numeric|min:0',
        ]);

        $advancePayments = $employee->advancePayments()
            ->whereIn('id', collect($validated['advances'])->pluck('id'))
            ->whereIn('status', ['approved', 'partially_repaid'])
            ->get();

        foreach ($advancePayments as $advancePayment) {
            $advance = collect($validated['advances'])->firstWhere('id', $advancePayment->id);
            $advancePayment->monthly_deduction = $advance['monthly_deduction'];
            $advancePayment->save();
        }

        return back()->with('success', 'Monthly deductions updated successfully.');
    }

    /**
     * Display payment history for an employee.
     */
    public function paymentHistory(Employee $employee)
    {
        $history = $this->getMonthlyHistory($employee);

        return Inertia::render('Payroll/Advances/History', [
            'employee' => [
                'id' => $employee->id,
                'first_name' => $employee->first_name,
                'last_name' => $employee->last_name,
                'total_advance_balance' => $employee->total_advance_balance,
            ],
            'history' => $history,
            'advancePayments' => $employee->advancePayments()
                ->whereIn('status', ['approved', 'partially_repaid', 'fully_repaid'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($payment) {
                    return [
                        'id' => $payment->id,
                        'amount' => $payment->amount,
                        'repaid_amount' => $payment->repaid_amount,
                        'balance' => $payment->remaining_balance,
                        'status' => $payment->status,
                        'payment_date' => $payment->payment_date ? $payment->payment_date->format('Y-m-d') : null,
                        'repayment_date' => $payment->repayment_date ? $payment->repayment_date->format('Y-m-d') : null,
                        'monthly_deduction' => $payment->monthly_deduction,
                    ];
                }),
        ]);
    }

    /**
     * Show create form
     */
    public function create(Employee $employee)
    {
        return Inertia::render('Payroll/Advances/Create', [
            'employee' => $employee
        ]);
    }

    /**
     * API endpoint for payment history
     */
    public function apiPaymentHistory(Employee $employee)
    {
        // Get the payment history grouped by month
        $history = $this->getMonthlyHistory($employee);

        // Get active advances
        $activeAdvances = $employee->advancePayments()
            ->whereIn('status', ['approved', 'partially_repaid'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'amount' => $payment->amount,
                    'repaid_amount' => $payment->repaid_amount,
                    'balance' => $payment->remaining_balance,
                    'status' => $payment->status,
                    'payment_date' => $payment->payment_date ? $payment->payment_date->format('Y-m-d') : null,
                    'repayment_date' => $payment->repayment_date ? $payment->repayment_date->format('Y-m-d') : null,
                    'monthly_deduction' => $payment->monthly_deduction,
                ];
            });

        $totalMonthlyDeduction = $activeAdvances->sum('monthly_deduction');
        $totalRemainingBalance = $activeAdvances->sum('balance');

        return response()->json([
            'history' => $history,
            'active_advances' => $activeAdvances,
            'employee' => [
                'id' => $employee->id,
                'name' => $employee->first_name . ' ' . $employee->last_name,
                'total_advance_balance' => $employee->total_advance_balance,
            ],
            'totals' => [
                'monthly_deduction' => $totalMonthlyDeduction,
                'remaining_balance' => $totalRemainingBalance
            ]
        ]);
    }

    /**
     * Delete a payment history record
     */
    public function deletePaymentHistory(Employee $employee, AdvancePaymentHistory $payment)
    {
        if (!Auth::user()->hasRole(['admin', 'finance_manager'])) {
            return back()->withErrors(['error' => 'You do not have permission to delete payment history.']);
        }

        // Verify payment belongs to this employee
        if ($payment->employee_id !== $employee->id) {
            return back()->withErrors(['error' => 'Payment record does not belong to this employee.']);
        }

        try {
            DB::beginTransaction();

            // Find the associated advance payment
            $advancePayment = $payment->advancePayment;

            if (!$advancePayment) {
                throw new \Exception('Associated advance payment not found.');
            }

            // Reduce the repaid amount on the advance
            $advancePayment->repaid_amount -= $payment->amount;

            // Update status based on new repaid amount
            if ($advancePayment->repaid_amount <= 0) {
                $advancePayment->repaid_amount = 0;
                $advancePayment->status = 'approved';
            } else if ($advancePayment->repaid_amount < $advancePayment->amount) {
                $advancePayment->status = 'partially_repaid';
            } else {
                $advancePayment->status = 'fully_repaid';
            }

            $advancePayment->save();

            // Delete the payment history record
            $payment->delete();

            // Update employee balance
            $employee->advance_payment = $employee->total_advance_balance;
            $employee->save();

            DB::commit();

            return back()->with('success', 'Payment history record deleted successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error deleting payment history: ' . $e->getMessage(), [
                'employee_id' => $employee->id,
                'payment_id' => $payment->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return back()->withErrors(['error' => 'Failed to delete payment history: ' . $e->getMessage()]);
        }
    }

    /**
     * Generate a receipt for a payment
     */
    public function receipt(Employee $employee, $payment)
    {
        $paymentRecord = AdvancePaymentHistory::findOrFail($payment);

        // Verify payment belongs to this employee
        if ($paymentRecord->employee_id !== $employee->id) {
            return back()->withErrors(['error' => 'Payment record does not belong to this employee.']);
        }

        $advance = $paymentRecord->advancePayment;

        if (!$advance) {
            return back()->withErrors(['error' => 'Associated advance payment not found.']);
        }

        $data = [
            'payment' => [
                'id' => $paymentRecord->id,
                'amount' => $paymentRecord->amount,
                'payment_date' => $paymentRecord->payment_date->format('Y-m-d'),
                'notes' => $paymentRecord->notes,
                'recorded_by' => $paymentRecord->recorder ? $paymentRecord->recorder->name : 'System',
                'created_at' => $paymentRecord->created_at->format('Y-m-d H:i:s'),
            ],
            'advance' => [
                'id' => $advance->id,
                'amount' => $advance->amount,
                'reason' => $advance->reason,
                'payment_date' => $advance->payment_date ? $advance->payment_date->format('Y-m-d') : null,
                'repaid_amount' => $advance->repaid_amount,
                'balance' => $advance->remaining_balance,
            ],
            'employee' => [
                'id' => $employee->id,
                'name' => $employee->first_name . ' ' . $employee->last_name,
                'position' => $employee->position,
                'employee_id' => $employee->employee_id,
            ],
            'company' => [
                'name' => config('app.name'),
                'address' => config('app.address', ''),
                'phone' => config('app.phone', ''),
                'email' => config('app.email', ''),
            ],
        ];

        return Inertia::render('Payroll/Advances/Receipt', $data);
    }
}


