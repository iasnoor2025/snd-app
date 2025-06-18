<?php

namespace Modules\Payroll\Services;

use Modules\Employee\Domain\Models\Employee;
use Modules\Payroll\Domain\Models\Payroll;
use Modules\Payroll\Domain\Models\PayrollItem;
use Modules\Payroll\Domain\Models\PayrollRun;
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
                // Check if payroll already exists for this month
                $existingPayroll = Payroll::where('employee_id', $employee->id)
                    ->where('payroll_month', $month->format('Y-m'))
                    ->first();

                if ($existingPayroll) {
                    $errors[] = "Payroll already exists for {$employee->full_name} for {$month->format('F Y')}";
                    continue;
                }

                // Generate payroll
                $payroll = $this->generateEmployeePayroll($employee, $month);
                $generatedPayrolls[] = $payroll;

            } catch (\Exception $e) {
                $errors[] = "Error processing {$employee->full_name}: {$e->getMessage()}";
                Log::error("Error generating payroll for employee {$employee->full_name}", [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
            }
        }

        if (count($errors) > 0) {
            Log::error("Encountered errors while generating payrolls", [
                'errors' => $errors
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

            // Calculate daily rate and base salary for worked days
            $dailyRate = $employee->current_base_salary / $employee->contract_days_per_month;
            $baseSalary = $dailyRate * $daysWorked;

            // Calculate allowances (prorated based on days worked)
            $allowanceRatio = $daysWorked / $employee->contract_days_per_month;
            $allowances = ($employee->food_allowance + $employee->housing_allowance + $employee->transport_allowance) * $allowanceRatio;

            // Calculate overtime
            $overtimeHours = $this->calculateOvertimeHours($employee, $month);
            $overtimeAmount = $this->calculateOvertimeAmount($employee, $overtimeHours);

            // Calculate performance bonus
            $performanceData = $this->calculatePerformanceBonus($employee, $month);

            // Calculate leave deductions
            $leaveData = $this->calculateLeaveDeductions($employee, $month);

            // Calculate gross salary
            $grossSalary = $baseSalary + $allowances + $overtimeAmount + $performanceData['bonus'];

            // Calculate tax and insurance
            $taxAndInsurance = $this->calculateTaxAndInsurance($employee, $grossSalary);

            // Calculate total deductions
            $totalDeductions = $leaveData['deductions'] +
                              $taxAndInsurance['tax'] +
                              $taxAndInsurance['insurance'] +
                              $taxAndInsurance['other'];

            // Calculate net salary
            $netSalary = $grossSalary - $totalDeductions;

            // Create payroll record
            $payroll = Payroll::create([
                'employee_id' => $employee->id,
                'payroll_month' => $month->format('Y-m'),
                'base_salary' => $baseSalary,
                'overtime_hours' => $overtimeHours,
                'overtime_amount' => $overtimeAmount,
                'bonus_amount' => $performanceData['bonus'],
                'deduction_amount' => $totalDeductions,
                'final_amount' => $netSalary,
                'total_worked_hours' => $regularHours,
                'status' => 'pending'
            ]);

            // Create payroll items
            $this->createPayrollItems($payroll, [
                [
                    'type' => 'base_salary',
                    'description' => "Base salary for {$daysWorked} days",
                    'amount' => $baseSalary,
                    'is_taxable' => true
                ],
                [
                    'type' => 'allowances',
                    'description' => "Prorated allowances ({$allowanceRatio})",
                    'amount' => $allowances,
                    'is_taxable' => false
                ],
                [
                    'type' => 'overtime',
                    'description' => "Overtime: {$overtimeHours} hours",
                    'amount' => $overtimeAmount,
                    'is_taxable' => true,
                    'metadata' => ['hours' => $overtimeHours]
                ],
                [
                    'type' => 'bonus',
                    'description' => "Performance bonus: {$performanceData['rating']}",
                    'amount' => $performanceData['bonus'],
                    'is_taxable' => true
                ],
                [
                    'type' => 'tax',
                    'description' => "Income tax",
                    'amount' => -$taxAndInsurance['tax'],
                    'is_taxable' => false
                ],
                [
                    'type' => 'insurance',
                    'description' => "Insurance deduction",
                    'amount' => -$taxAndInsurance['insurance'],
                    'is_taxable' => false
                ]
            ]);

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
        return $employee->timesheets()
            ->whereYear('date', $month->year)
            ->whereMonth('date', $month->month)
            ->where('status', 'approved')
            ->sum('overtime_hours');
    }

    /**
     * Calculate overtime amount
     */
    protected function calculateOvertimeAmount(Employee $employee, float $overtimeHours): float
    {
        $hourlyRate = $employee->current_base_salary / ($employee->contract_days_per_month * 8);
        return $overtimeHours * ($hourlyRate * 1.5); // 1.5x for overtime;
    }

    /**
     * Calculate worked days and regular hours from timesheets
     */
    protected function calculateWorkedDays(Employee $employee, Carbon $month): array
    {
        $timesheets = $employee->timesheets()
            ->whereYear('date', $month->year)
            ->whereMonth('date', $month->month)
            ->where('status', 'approved')
            ->get();

        return [
            'days_worked' => $timesheets->count(),
            'regular_hours' => $timesheets->sum('regular_hours')
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
            'paid_leaves' => 0,
            'unpaid_leaves' => 0,
            'deductions' => 0
        ];

        // Get leave records for the month
        $leaves = $employee->leaves()
            ->whereYear('start_date', $month->year)
            ->whereMonth('start_date', $month->month)
            ->where('status', 'approved')
            ->get();

        foreach ($leaves as $leave) {
            if ($leave->is_paid) {
                $leaveData['paid_leaves'] += $leave->duration;
            } else {
                $leaveData['unpaid_leaves'] += $leave->duration;
                // Calculate deduction for unpaid leaves
                $dailyRate = $employee->current_base_salary / $employee->contract_days_per_month;
                $leaveData['deductions'] += $dailyRate * $leave->duration;
            }
        }

        return $leaveData;
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
     * Approve payroll
     */
    public function approvePayroll(Payroll $payroll, int $approvedBy): void
    {
        $payroll->approve(User::find($approvedBy));
    }
}




