<?php

namespace Modules\PayrollManagement\Services;

use Modules\EmployeeManagement\Domain\Models\Employee;
use Modules\PayrollManagement\Domain\Models\Payroll;
use Modules\PayrollManagement\Domain\Models\PayrollItem;
use Modules\PayrollManagement\Domain\Models\PayrollRun;
use Modules\Core\Domain\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Collection;

class PayrollService
{
    /**
     * Generate payroll for the specified month
     *
     * @param Carbon|string|null $month The month to generate payroll for (defaults to previous month)
     * @param Employee|null $employee Specific employee to generate payroll for (if null, generates for all active employees)
     * @return Payroll|array Returns a single Payroll object if employee is specified, otherwise returns array of Payroll objects;
     * @throws \Exception
     */
    public function generatePayroll($month = null, ?Employee $employee = null)
    {
        $month = $month ? Carbon::parse($month) : Carbon::now()->subMonth();
        $errors = [];
        $generatedPayrolls = [];

        // If employee is specified, only generate for that employee
        $employees = $employee ? collect([$employee]) : Employee::where('status', 'active')->get();

        foreach ($employees as $employee) {
            try {
                            // Validate employee data
            if (!$employee->basic_salary) {
                throw new \Exception("Employee {$employee->full_name} has no base salary configured");
            }

                // Check if payroll already exists for this month
                $existingPayroll = Payroll::where('employee_id', $employee->id)
                    ->where('month', $month->month)
                    ->where('year', $month->year)
                    ->first();

                if ($existingPayroll) {
                    $errors[] = "Payroll already exists for {$employee->full_name} for {$month->format('F Y')}";
                    continue;
                }

                // Check if employee has any manager-approved timesheets for the month
                $timesheets = $employee->timesheets()
                    ->whereYear('date', $month->year)
                    ->whereMonth('date', $month->month)
                    ->where('status', 'manager_approved')
                    ->count();

                // Only generate payroll if employee has manager-approved timesheets
                if ($timesheets === 0) {
                    Log::info("No manager-approved timesheets found for {$employee->full_name} for {$month->format('F Y')}, skipping payroll generation");
                    $errors[] = "No manager-approved timesheets found for {$employee->full_name} for {$month->format('F Y')}";
                    continue;
                }

                // Generate payroll only for employees with approved timesheets
                $payroll = $this->generateEmployeePayroll($employee, $month);
                $generatedPayrolls[] = $payroll;

            } catch (\Exception $e) {
                $errors[] = "Error processing {$employee->full_name}: {$e->getMessage()}";
                Log::error("Error generating payroll for employee {$employee->full_name}", [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'employee_id' => $employee->id,
                    'month' => $month->format('Y-m')
                ]);
            }
        }

        if (count($errors) > 0) {
            Log::error("Encountered errors while generating payrolls", [
                'errors' => $errors,
                'month' => $month->format('Y-m')
            ]);
            throw new \Exception("Encountered " . count($errors) . " errors:\n- " . implode("\n- ", $errors));
        }

        return $employee ? $generatedPayrolls[0] : $generatedPayrolls;
    }

    /**
     * Generate payroll for a specific employee
     */
    protected function generateEmployeePayroll(Employee $employee, Carbon $month): Payroll
    {
        try {
            // Calculate worked days and hours
            $workData = $this->calculateWorkedDays($employee, $month);
            $daysWorked = $workData['days_worked'];
            $regularHours = $workData['regular_hours'];

            // Calculate base salary for worked days
            $workingDaysInMonth = Carbon::parse($month)->daysInMonth;
            $dailyRate = $employee->basic_salary / $workingDaysInMonth;
            $baseSalary = $dailyRate * $daysWorked;

            // Calculate allowances (if any)
            $allowances = 0;
            if (method_exists($employee, 'getAllowances')) {
                $allowances = $employee->getAllowances();
            }

            // Calculate overtime
            $overtimeHours = $this->calculateOvertimeHours($employee, $month);
            $overtimeAmount = $this->calculateOvertimeAmount($employee, $overtimeHours);

            // Calculate performance bonus
            $performanceData = $this->calculatePerformanceBonus($employee, $month);

            // Calculate leave deductions
            $leaveData = $this->calculateLeaveDeductions($employee, $month);

            // Calculate advance deductions
            $advanceData = $this->calculateAdvanceDeductions($employee, $month);

            // Calculate gross salary
            $grossSalary = $baseSalary + $allowances + $overtimeAmount + $performanceData['bonus'];

            // Calculate tax and insurance
            $taxAndInsurance = $this->calculateTaxAndInsurance($employee, $grossSalary);

            // Calculate total deductions
            $totalDeductions = $leaveData['deductions'] +
                              $taxAndInsurance['tax'] +
                              $taxAndInsurance['insurance'] +
                              $taxAndInsurance['other'] +
                              $advanceData['total_advance_deduction'];

            // Calculate net salary
            $netSalary = $grossSalary - $totalDeductions;

            // Since we only generate payroll for employees with manager-approved timesheets
            $notes = "Generated for {$month->format('F Y')} based on manager-approved timesheets";

            // Create payroll record
            $payroll = Payroll::create([
                'employee_id' => $employee->id,
                'month' => $month->month,
                'year' => $month->year,
                'base_salary' => $baseSalary,
                'overtime_hours' => $overtimeHours,
                'overtime_amount' => $overtimeAmount,
                'bonus_amount' => $performanceData['bonus'],
                'deduction_amount' => $totalDeductions,
                'advance_deduction' => $advanceData['total_advance_deduction'],
                'final_amount' => $netSalary,
                'total_worked_hours' => $regularHours,
                'status' => 'pending',
                'notes' => $notes
            ]);

            // Create payroll items
            $this->createPayrollItems($payroll, [
                [
                    'type' => 'base_salary',
                    'description' => "Base salary for {$daysWorked} days",
                    'amount' => $baseSalary,
                    'is_taxable' => true
                ]
            ]);

            // Add allowances item if there are any
            if ($allowances > 0) {
                $this->createPayrollItems($payroll, [
                    [
                        'type' => 'allowances',
                        'description' => "Monthly allowances",
                        'amount' => $allowances,
                        'is_taxable' => false
                    ]
                ]);
            }

            // Add overtime if any
            if ($overtimeAmount > 0) {
                $this->createPayrollItems($payroll, [
                    [
                        'type' => 'overtime',
                        'description' => "Overtime: {$overtimeHours} hours",
                        'amount' => $overtimeAmount,
                        'is_taxable' => true,
                        'metadata' => ['hours' => $overtimeHours]
                    ]
                ]);
            }

            // Add bonus if any
            if ($performanceData['bonus'] > 0) {
                $this->createPayrollItems($payroll, [
                    [
                        'type' => 'bonus',
                        'description' => "Performance bonus: {$performanceData['rating']}",
                        'amount' => $performanceData['bonus'],
                        'is_taxable' => true
                    ]
                ]);
            }

            // Add deductions
            if ($taxAndInsurance['tax'] > 0) {
                $this->createPayrollItems($payroll, [
                    [
                        'type' => 'tax',
                        'description' => "Income tax",
                        'amount' => -$taxAndInsurance['tax'],
                        'is_taxable' => false
                    ]
                ]);
            }

            if ($taxAndInsurance['insurance'] > 0) {
                $this->createPayrollItems($payroll, [
                    [
                        'type' => 'insurance',
                        'description' => "Insurance deduction",
                        'amount' => -$taxAndInsurance['insurance'],
                        'is_taxable' => false
                    ]
                ]);
            }

            // Add advance deductions
            if ($advanceData['total_advance_deduction'] > 0) {
                foreach ($advanceData['advance_details'] as $advanceDetail) {
                    $this->createPayrollItems($payroll, [
                        [
                            'type' => 'advance_deduction',
                            'description' => "Advance repayment: {$advanceDetail['reason']}",
                            'amount' => -$advanceDetail['amount'],
                            'is_taxable' => false,
                            'metadata' => [
                                'advance_id' => $advanceDetail['advance_id'],
                                'remaining_balance' => $advanceDetail['remaining_balance']
                            ]
                        ]
                    ]);
                }
            }

            return $payroll;
        } catch (\Exception $e) {
            Log::error("Error generating payroll for employee {$employee->full_name}", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Calculate overtime hours for an employee
     */
    protected function calculateOvertimeHours(Employee $employee, Carbon $month): float
    {
        $overtimeHours = $employee->timesheets()
            ->whereYear('date', $month->year)
            ->whereMonth('date', $month->month)
            ->where('status', 'manager_approved')
            ->sum('overtime_hours');

        // If no timesheets found, assume no overtime
        if ($overtimeHours === 0) {
            $timesheets = $employee->timesheets()
                ->whereYear('date', $month->year)
                ->whereMonth('date', $month->month)
                ->where('status', 'manager_approved')
                ->count();

            if ($timesheets === 0) {
                return 0; // No overtime if no timesheets
            }
        }

        return $overtimeHours;
    }

    /**
     * Calculate overtime amount
     */
    protected function calculateOvertimeAmount(Employee $employee, float $overtimeHours): float
    {
        $workingDaysInMonth = Carbon::now()->daysInMonth;
        $hourlyRate = $employee->basic_salary / ($workingDaysInMonth * 8); // 8 hours per day
        return $overtimeHours * ($hourlyRate * 1.5); // 1.5x for overtime
    }

    /**
     * Calculate worked days and regular hours from timesheets
     */
    protected function calculateWorkedDays(Employee $employee, Carbon $month): array
    {
        $timesheets = $employee->timesheets()
            ->whereYear('date', $month->year)
            ->whereMonth('date', $month->month)
            ->where('status', 'manager_approved')
            ->get();

        $totalHours = 0;
        $daysWorked = 0;

        foreach ($timesheets as $timesheet) {
            $totalHours += $timesheet->total_hours;
            if ($timesheet->total_hours > 0) {
                $daysWorked++;
            }
        }

        // Since we only generate payroll for employees with manager-approved timesheets,
        // we should always have timesheets here. If not, throw an exception.
        if ($timesheets->isEmpty()) {
            throw new \Exception("No manager-approved timesheets found for {$employee->full_name} for {$month->format('F Y')}");
        }

        return [
            'days_worked' => $daysWorked,
            'regular_hours' => $totalHours
        ];
    }

    /**
     * Calculate performance bonus
     */
    protected function calculatePerformanceBonus(Employee $employee, Carbon $month): array
    {
        // This is a placeholder. Implement your performance bonus logic here
        return [
            'rating' => 'N/A',
            'bonus' => 0
        ];
    }

    /**
     * Calculate leave deductions
     */
    protected function calculateLeaveDeductions(Employee $employee, Carbon $month): array
    {
        $leaveData = [
            'unpaid_leaves' => 0,
            'deductions' => 0
        ];

        // Check if employee has leaves relationship
        if (method_exists($employee, 'leaves')) {
            // Get unpaid leaves for the month
            $unpaidLeaves = $employee->leaves()
                ->whereYear('start_date', $month->year)
                ->whereMonth('start_date', $month->month)
                ->where('status', 'approved')
                ->where('type', 'unpaid')
                ->get();

            $workingDaysInMonth = Carbon::parse($month)->daysInMonth;
            $dailyRate = $employee->basic_salary / $workingDaysInMonth;

            foreach ($unpaidLeaves as $leave) {
                $leaveData['unpaid_leaves'] += $leave->duration;
                $leaveData['deductions'] += $dailyRate * $leave->duration;
            }
        }

        return $leaveData;
    }

    /**
     * Calculate advance payment deductions based on repayment dates and amounts
     */
    protected function calculateAdvanceDeductions(Employee $employee, Carbon $month): array
    {
        $advanceData = [
            'total_advance_deduction' => 0,
            'advance_details' => []
        ];

        // Get active advance payments for the employee
        $activeAdvances = \Modules\EmployeeManagement\Domain\Models\AdvancePayment::where('employee_id', $employee->id)
            ->whereIn('status', ['approved', 'partially_repaid'])
            ->get();

        foreach ($activeAdvances as $advance) {
            $remainingBalance = $advance->remaining_balance;

            // Only process if there's remaining balance
            if ($remainingBalance > 0) {
                // Check for repayment history in the specific month
                $monthlyRepayments = \Modules\EmployeeManagement\Domain\Models\AdvancePaymentHistory::where('advance_payment_id', $advance->id)
                    ->whereYear('payment_date', $month->year)
                    ->whereMonth('payment_date', $month->month)
                    ->sum('amount');

                // If there are repayments scheduled for this month, use that amount
                if ($monthlyRepayments > 0) {
                    $deductionAmount = min($monthlyRepayments, $remainingBalance);

                    $advanceData['total_advance_deduction'] += $deductionAmount;
                    $advanceData['advance_details'][] = [
                        'advance_id' => $advance->id,
                        'amount' => $deductionAmount,
                        'remaining_balance' => $remainingBalance,
                        'monthly_repayments' => $monthlyRepayments,
                        'reason' => $advance->reason,
                        'payment_date' => $month->format('Y-m')
                    ];
                }
                // If no specific repayments for this month, check if advance has repayment_date in this month
                elseif ($advance->repayment_date &&
                        $advance->repayment_date->year === $month->year &&
                        $advance->repayment_date->month === $month->month) {

                    $deductionAmount = min($advance->monthly_deduction ?? $remainingBalance, $remainingBalance);

                    $advanceData['total_advance_deduction'] += $deductionAmount;
                    $advanceData['advance_details'][] = [
                        'advance_id' => $advance->id,
                        'amount' => $deductionAmount,
                        'remaining_balance' => $remainingBalance,
                        'monthly_deduction' => $advance->monthly_deduction,
                        'reason' => $advance->reason,
                        'repayment_date' => $advance->repayment_date->format('Y-m-d')
                    ];
                }
            }
        }

        return $advanceData;
    }

    /**
     * Calculate tax and insurance deductions
     */
    protected function calculateTaxAndInsurance(Employee $employee, float $grossSalary): array
    {
        $deductions = [
            'tax' => 0,
            'insurance' => 0,
            'other' => 0
        ];

        // Calculate tax based on salary brackets
        if ($grossSalary > 10000) {
            $deductions['tax'] = $grossSalary * 0.1; // 10% tax
        } elseif ($grossSalary > 5000) {
            $deductions['tax'] = $grossSalary * 0.05; // 5% tax
        }

        // Calculate insurance (example: 2% of gross salary)
        $deductions['insurance'] = $grossSalary * 0.02;

        return $deductions;
    }

    /**
     * Create payroll items
     */
    protected function createPayrollItems(Payroll $payroll, array $items): void
    {
        foreach ($items as $item) {
            PayrollItem::create(array_merge(
                ['payroll_id' => $payroll->id],
                $item
            ));
        }
    }

    /**
     * Run payroll for a month
     */
    public function runPayrollForMonth(Carbon $month, int $runByUserId): PayrollRun
    {
        $batchId = Str::uuid()->toString();
        $employees = Employee::where('status', 'active')->get();

        $payrollRun = PayrollRun::create([
            'batch_id' => $batchId,
            'run_by' => $runByUserId,
            'status' => 'pending',
            'total_employees' => $employees->count(),
            'run_date' => $month
        ]);

        foreach ($employees as $employee) {
            $this->generatePayroll($month, $employee);
        }

        return $payrollRun;
    }

    /**
     * Approve payroll run
     */
    public function approvePayrollRun(PayrollRun $payrollRun): void
    {
        DB::transaction(function () use ($payrollRun) {
            $payrollRun->payrolls->each(function ($payroll) {
                $payroll->approve(auth()->user());
            });

            $payrollRun->complete();
        });
    }

    /**
     * Reject payroll run
     */
    public function rejectPayrollRun(PayrollRun $payrollRun, string $notes): void
    {
        DB::transaction(function () use ($payrollRun, $notes) {
            $payrollRun->payrolls->each(function ($payroll) {
                $payroll->cancel();
            });

            $payrollRun->reject($notes);
        });
    }

    /**
     * Process payroll payment
     */
    public function processPayment(Payroll $payroll, string $paymentMethod, ?string $reference = null, ?int $paidBy = null): void
    {
        DB::transaction(function () use ($payroll, $paymentMethod, $reference, $paidBy) {
            $payroll->update([
                'payment_method' => $paymentMethod,
                'payment_reference' => $reference,
                'payment_status' => 'paid',
                'payment_processed_at' => now()
            ]);

            if ($paidBy) {
                $payroll->markAsPaid(User::find($paidBy));
            }

            // Create payment log
            PayrollItem::create([
                'payroll_id' => $payroll->id,
                'type' => 'payment',
                'description' => "Payment processed via {$paymentMethod}" . ($reference ? " (Ref: {$reference})" : ''),
                'amount' => $payroll->final_amount,
                'is_taxable' => false
            ]);
        });
    }

    /**
     * Check if employee has manager-approved timesheets for a specific month
     */
    public function hasManagerApprovedTimesheets(Employee $employee, Carbon $month): bool
    {
        return $employee->timesheets()
            ->whereYear('date', $month->year)
            ->whereMonth('date', $month->month)
            ->where('status', 'manager_approved')
            ->exists();
    }

    /**
     * Get manager-approved timesheets for an employee in a specific month
     */
    public function getManagerApprovedTimesheets(Employee $employee, Carbon $month)
    {
        return $employee->timesheets()
            ->whereYear('date', $month->year)
            ->whereMonth('date', $month->month)
            ->where('status', 'manager_approved')
            ->get();
    }

    /**
     * Approve payroll
     */
    public function approvePayroll(Payroll $payroll, int $approvedBy): void
    {
        $payroll->approve(User::find($approvedBy));
    }
}




