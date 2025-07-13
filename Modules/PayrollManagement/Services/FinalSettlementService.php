<?php

namespace Modules\PayrollManagement\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;
use Modules\PayrollManagement\Domain\Models\FinalSettlement;
use Modules\EmployeeManagement\Domain\Models\Employee;
use Modules\EmployeeManagement\Domain\Models\Resignation;
use Illuminate\Support\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Carbon\Carbon;

class FinalSettlementService
{
    /**
     * Calculate final settlement for an employee
     *
     * @param int $employeeId
     * @param array $data
     * @return array
     */
    public function calculateSettlement(int $employeeId, array $data): array
    {
        try {
            // Get employee details
            $employee = DB::table('employees')->where('id', $employeeId)->first();
            if (!$employee) {
                return [
                    'success' => false,
                    'message' => 'Employee not found',
                    'data' => null
                ];
            }

            // Calculate basic settlement components
            $basicSalary = $employee->basic_salary ?? 0;
            $lastWorkingDay = $data['last_working_day'] ?? now()->toDateString();
            $resignationDate = $data['resignation_date'] ?? now()->toDateString();

            // Calculate gratuity (assuming 15 days salary for each year of service)
            $serviceYears = now()->diffInYears($employee->joining_date ?? now());
            $gratuity = ($basicSalary / 30) * 15 * $serviceYears;

            // Calculate leave encashment (assuming 30 days annual leave)
            $pendingLeaves = $data['pending_leaves'] ?? 0;
            $leaveEncashment = ($basicSalary / 30) * $pendingLeaves;

            // Calculate notice period recovery
            $noticePeriodDays = $data['notice_period_days'] ?? 0;
            $noticePeriodRecovery = ($basicSalary / 30) * $noticePeriodDays;

            // Calculate other deductions
            $otherDeductions = $data['other_deductions'] ?? 0;
            $loanRecovery = $data['loan_recovery'] ?? 0;

            // Calculate total settlement
            $totalEarnings = $basicSalary + $gratuity + $leaveEncashment;
            $totalDeductions = $noticePeriodRecovery + $otherDeductions + $loanRecovery;
            $netSettlement = $totalEarnings - $totalDeductions;

            $settlementData = [
                'employee_id' => $employeeId,
                'basic_salary' => $basicSalary,
                'gratuity' => $gratuity,
                'leave_encashment' => $leaveEncashment,
                'notice_period_recovery' => $noticePeriodRecovery,
                'other_deductions' => $otherDeductions,
                'loan_recovery' => $loanRecovery,
                'total_earnings' => $totalEarnings,
                'total_deductions' => $totalDeductions,
                'net_settlement' => $netSettlement,
                'last_working_day' => $lastWorkingDay,
                'resignation_date' => $resignationDate,
                'service_years' => $serviceYears,
                'status' => 'calculated',
                'calculated_at' => now(),
            ];

            return [
                'success' => true,
                'message' => 'Final settlement calculated successfully',
                'data' => $settlementData
            ];
        } catch (Exception $e) {
            Log::error('Failed to calculate final settlement', [
                'employee_id' => $employeeId,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'message' => 'Failed to calculate final settlement',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Process settlement payment
     *
     * @param int $settlementId
     * @param array $paymentData
     * @return array
     */
    public function processPayment(int $settlementId, array $paymentData): array
    {
        try {
            DB::beginTransaction();

            // Update settlement with payment information
            $updated = DB::table('final_settlements')
                ->where('id', $settlementId)
                ->update([
                    'status' => 'paid',
                    'payment_method' => $paymentData['payment_method'] ?? 'bank_transfer',
                    'payment_reference' => $paymentData['payment_reference'] ?? null,
                    'paid_amount' => $paymentData['paid_amount'] ?? 0,
                    'payment_date' => $paymentData['payment_date'] ?? now(),
                    'paid_by' => auth()->id(),
                    'payment_notes' => $paymentData['payment_notes'] ?? null,
                    'updated_at' => now(),
                ]);

            if (!$updated) {
                DB::rollBack();
                return [
                    'success' => false,
                    'message' => 'Settlement not found',
                    'data' => null
                ];
            }

            DB::commit();

            Log::info('Settlement payment processed', [
                'settlement_id' => $settlementId,
                'amount' => $paymentData['paid_amount'] ?? 0
            ]);

            return [
                'success' => true,
                'message' => 'Settlement payment processed successfully',
                'data' => [
                    'settlement_id' => $settlementId,
                    'status' => 'paid',
                    'payment_date' => $paymentData['payment_date'] ?? now()->toDateString(),
                ]
            ];
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Failed to process settlement payment', [
                'settlement_id' => $settlementId,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'message' => 'Failed to process settlement payment',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Get employee settlements
     *
     * @param int $employeeId
     * @return array
     */
    public function getEmployeeSettlements(int $employeeId): array
    {
        try {
            $settlements = DB::table('final_settlements')
                ->where('employee_id', $employeeId)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($settlement) {
                    return [
                        'id' => $settlement->id,
                        'employee_id' => $settlement->employee_id,
                        'net_settlement' => $settlement->net_settlement,
                        'status' => $settlement->status,
                        'last_working_day' => $settlement->last_working_day,
                        'payment_date' => $settlement->payment_date,
                        'created_at' => $settlement->created_at,
                        'updated_at' => $settlement->updated_at,
                    ];
                })
                ->toArray();

            return [
                'success' => true,
                'data' => $settlements,
                'message' => 'Employee settlements retrieved successfully'
            ];
        } catch (Exception $e) {
            Log::error('Failed to retrieve employee settlements', [
                'employee_id' => $employeeId,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'message' => 'Failed to retrieve employee settlements',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Generate settlement document
     *
     * @param int $settlementId
     * @return array
     */
    public function generateDocument(int $settlementId): array
    {
        try {
            // Get settlement details
            $settlement = DB::table('final_settlements')
                ->join('employees', 'final_settlements.employee_id', '=', 'employees.id')
                ->where('final_settlements.id', $settlementId)
                ->select('final_settlements.*', 'employees.name as employee_name', 'employees.employee_id as emp_code')
                ->first();

            if (!$settlement) {
                return [
                    'success' => false,
                    'message' => 'Settlement not found',
                    'data' => null
                ];
            }

            // For now, return document data structure
            // In a real implementation, this would generate PDF using a library like TCPDF or DomPDF
            $documentData = [
                'settlement_id' => $settlementId,
                'employee_name' => $settlement->employee_name,
                'employee_code' => $settlement->emp_code,
                'net_settlement' => $settlement->net_settlement,
                'total_earnings' => $settlement->total_earnings,
                'total_deductions' => $settlement->total_deductions,
                'last_working_day' => $settlement->last_working_day,
                'document_generated_at' => now(),
                'document_type' => 'final_settlement_letter',
            ];

            // Update settlement to mark document as generated
            DB::table('final_settlements')
                ->where('id', $settlementId)
                ->update([
                    'document_generated' => true,
                    'document_generated_at' => now(),
                    'updated_at' => now(),
                ]);

            return [
                'success' => true,
                'message' => 'Settlement document generated successfully',
                'data' => $documentData
            ];
        } catch (Exception $e) {
            Log::error('Failed to generate settlement document', [
                'settlement_id' => $settlementId,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'message' => 'Failed to generate settlement document',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Get all final settlements with optional filtering
     */
    public function getSettlements(array $filters = []): LengthAwarePaginator
    {
        $query = FinalSettlement::with(['employee', 'resignation', 'processedBy']);

        // Apply filters
        if (isset($filters['employee_id'])) {
            $query->where('employee_id', $filters['employee_id']);
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        return $query->orderBy('created_at', 'desc')
                    ->paginate($filters['per_page'] ?? 15);
    }

    /**
     * Create final settlement for employee
     */
    public function createSettlement(int $employeeId, int $resignationId = null): FinalSettlement
    {
        $employee = Employee::findOrFail($employeeId);
        $resignation = $resignationId ? Resignation::findOrFail($resignationId) : null;

        // Check if settlement already exists
        $existingSettlement = FinalSettlement::where('employee_id', $employeeId)->first();
        if ($existingSettlement) {
            throw new \Exception('Final settlement already exists for this employee');
        }

        // Calculate settlement components
        $settlementData = $this->calculateSettlementComponents($employee, $resignation);

        $settlement = FinalSettlement::create([
            'employee_id' => $employeeId,
            'resignation_id' => $resignationId,
            'last_working_date' => $resignation?->last_working_date ?? now(),
            'basic_salary' => $employee->basic_salary ?? 0,
            'allowances' => $settlementData['allowances'],
            'overtime_amount' => $settlementData['overtime_amount'],
            'leave_encashment' => $settlementData['leave_encashment'],
            'gratuity_amount' => $settlementData['gratuity_amount'],
            'bonus_amount' => $settlementData['bonus_amount'],
            'advance_deduction' => $settlementData['advance_deduction'],
            'loan_deduction' => $settlementData['loan_deduction'],
            'other_deductions' => $settlementData['other_deductions'],
            'gross_amount' => $settlementData['gross_amount'],
            'total_deductions' => $settlementData['total_deductions'],
            'net_amount' => $settlementData['net_amount'],
            'status' => 'pending',
            'calculation_date' => now(),
        ]);

        return $settlement->load(['employee', 'resignation', 'processedBy']);
    }

    /**
     * Update settlement
     */
    public function updateSettlement(FinalSettlement $settlement, array $data): FinalSettlement
    {
        if ($settlement->status !== 'pending') {
            throw new \Exception('Only pending settlements can be updated');
        }

        // Recalculate if any amounts are updated
        $updatedData = array_merge($settlement->toArray(), $data);

        $grossAmount = ($updatedData['basic_salary'] ?? 0) +
                      ($updatedData['allowances'] ?? 0) +
                      ($updatedData['overtime_amount'] ?? 0) +
                      ($updatedData['leave_encashment'] ?? 0) +
                      ($updatedData['gratuity_amount'] ?? 0) +
                      ($updatedData['bonus_amount'] ?? 0);

        $totalDeductions = ($updatedData['advance_deduction'] ?? 0) +
                          ($updatedData['loan_deduction'] ?? 0) +
                          ($updatedData['other_deductions'] ?? 0);

        $netAmount = $grossAmount - $totalDeductions;

        $settlement->update(array_merge($data, [
            'gross_amount' => $grossAmount,
            'total_deductions' => $totalDeductions,
            'net_amount' => $netAmount,
        ]));

        return $settlement->fresh(['employee', 'resignation', 'processedBy']);
    }

    /**
     * Approve settlement
     */
    public function approveSettlement(FinalSettlement $settlement, int $approvedBy): FinalSettlement
    {
        if ($settlement->status !== 'pending') {
            throw new \Exception('Only pending settlements can be approved');
        }

        $settlement->update([
            'status' => 'approved',
            'approved_by' => $approvedBy,
            'approved_date' => now(),
        ]);

        return $settlement->fresh(['employee', 'resignation', 'processedBy']);
    }

    /**
     * Mark settlement as paid
     */
    public function markAsPaid(FinalSettlement $settlement, array $paymentData): FinalSettlement
    {
        if ($settlement->status !== 'approved') {
            throw new \Exception('Only approved settlements can be marked as paid');
        }

        $settlement->update([
            'status' => 'paid',
            'paid_date' => now(),
            'payment_method' => $paymentData['payment_method'] ?? 'bank_transfer',
            'payment_reference' => $paymentData['payment_reference'] ?? null,
            'payment_notes' => $paymentData['payment_notes'] ?? null,
        ]);

        return $settlement->fresh(['employee', 'resignation', 'processedBy']);
    }

    /**
     * Cancel settlement
     */
    public function cancelSettlement(FinalSettlement $settlement, string $reason): FinalSettlement
    {
        if ($settlement->status === 'paid') {
            throw new \Exception('Paid settlements cannot be cancelled');
        }

        $settlement->update([
            'status' => 'cancelled',
            'cancellation_reason' => $reason,
            'cancelled_date' => now(),
        ]);

        return $settlement->fresh(['employee', 'resignation', 'processedBy']);
    }

    /**
     * Generate settlement report
     */
    public function generateSettlementReport(FinalSettlement $settlement): array
    {
        $employee = $settlement->employee;
        $resignation = $settlement->resignation;

        return [
            'settlement_id' => $settlement->id,
            'employee' => [
                'name' => $employee->full_name,
                'employee_id' => $employee->employee_id,
                'department' => $employee->department?->name,
                'position' => $employee->designation?->title,
                'joining_date' => $employee->joining_date,
                'last_working_date' => $settlement->last_working_date,
            ],
            'service_details' => [
                'total_service_years' => $this->calculateServiceYears($employee->joining_date, $settlement->last_working_date),
                'resignation_reason' => $resignation?->reason,
                'notice_period_served' => $resignation ? $this->calculateNoticePeriod($resignation) : null,
            ],
            'earnings' => [
                'basic_salary' => $settlement->basic_salary,
                'allowances' => $settlement->allowances,
                'overtime_amount' => $settlement->overtime_amount,
                'leave_encashment' => $settlement->leave_encashment,
                'gratuity_amount' => $settlement->gratuity_amount,
                'bonus_amount' => $settlement->bonus_amount,
                'gross_amount' => $settlement->gross_amount,
            ],
            'deductions' => [
                'advance_deduction' => $settlement->advance_deduction,
                'loan_deduction' => $settlement->loan_deduction,
                'other_deductions' => $settlement->other_deductions,
                'total_deductions' => $settlement->total_deductions,
            ],
            'summary' => [
                'net_amount' => $settlement->net_amount,
                'status' => $settlement->status,
                'calculation_date' => $settlement->calculation_date,
                'approved_date' => $settlement->approved_date,
                'paid_date' => $settlement->paid_date,
            ],
        ];
    }

    /**
     * Calculate settlement components
     */
    protected function calculateSettlementComponents(Employee $employee, ?Resignation $resignation): array
    {
        $basicSalary = $employee->basic_salary ?? 0;
        $joiningDate = Carbon::parse($employee->joining_date);
        $lastWorkingDate = $resignation?->last_working_date ?
            Carbon::parse($resignation->last_working_date) : now();

        // Calculate service years
        $serviceYears = $this->calculateServiceYears($joiningDate, $lastWorkingDate);

        // Calculate components
        $allowances = $this->calculateAllowances($employee);
        $overtimeAmount = $this->calculateOvertimeAmount($employee);
        $leaveEncashment = $this->calculateLeaveEncashment($employee);
        $gratuityAmount = $this->calculateGratuity($basicSalary, $serviceYears);
        $bonusAmount = $this->calculateBonus($employee);
        $advanceDeduction = $this->calculateAdvanceDeduction($employee);
        $loanDeduction = $this->calculateLoanDeduction($employee);
        $otherDeductions = $this->calculateOtherDeductions($employee);

        $grossAmount = $basicSalary + $allowances + $overtimeAmount +
                      $leaveEncashment + $gratuityAmount + $bonusAmount;

        $totalDeductions = $advanceDeduction + $loanDeduction + $otherDeductions;
        $netAmount = $grossAmount - $totalDeductions;

        return [
            'allowances' => $allowances,
            'overtime_amount' => $overtimeAmount,
            'leave_encashment' => $leaveEncashment,
            'gratuity_amount' => $gratuityAmount,
            'bonus_amount' => $bonusAmount,
            'advance_deduction' => $advanceDeduction,
            'loan_deduction' => $loanDeduction,
            'other_deductions' => $otherDeductions,
            'gross_amount' => $grossAmount,
            'total_deductions' => $totalDeductions,
            'net_amount' => $netAmount,
        ];
    }

    /**
     * Calculate service years
     */
    protected function calculateServiceYears($joiningDate, $lastWorkingDate): float
    {
        return Carbon::parse($joiningDate)->diffInYears(Carbon::parse($lastWorkingDate), true);
    }

    /**
     * Calculate allowances
     */
    protected function calculateAllowances(Employee $employee): float
    {
        // This would calculate various allowances based on employee data
        return ($employee->house_allowance ?? 0) +
               ($employee->transport_allowance ?? 0) +
               ($employee->medical_allowance ?? 0);
    }

    /**
     * Calculate overtime amount
     */
    protected function calculateOvertimeAmount(Employee $employee): float
    {
        // This would calculate pending overtime payments
        return 0; // Placeholder
    }

    /**
     * Calculate leave encashment
     */
    protected function calculateLeaveEncashment(Employee $employee): float
    {
        // This would calculate leave balance to be encashed
        return 0; // Placeholder
    }

    /**
     * Calculate gratuity
     */
    protected function calculateGratuity(float $basicSalary, float $serviceYears): float
    {
        // Gratuity calculation: 21 days salary for each year of service
        if ($serviceYears >= 1) {
            return ($basicSalary / 30) * 21 * $serviceYears;
        }
        return 0;
    }

    /**
     * Calculate bonus
     */
    protected function calculateBonus(Employee $employee): float
    {
        // This would calculate any pending bonus payments
        return 0; // Placeholder
    }

    /**
     * Calculate advance deduction
     */
    protected function calculateAdvanceDeduction(Employee $employee): float
    {
        // This would calculate pending advance deductions
        return 0; // Placeholder
    }

    /**
     * Calculate loan deduction
     */
    protected function calculateLoanDeduction(Employee $employee): float
    {
        // This would calculate pending loan deductions
        return 0; // Placeholder
    }

    /**
     * Calculate other deductions
     */
    protected function calculateOtherDeductions(Employee $employee): float
    {
        // This would calculate any other pending deductions
        return 0; // Placeholder
    }

    /**
     * Calculate notice period
     */
    protected function calculateNoticePeriod(?Resignation $resignation): ?int
    {
        if (!$resignation || !$resignation->resignation_date || !$resignation->last_working_date) {
            return null;
        }

        return Carbon::parse($resignation->resignation_date)
                   ->diffInDays(Carbon::parse($resignation->last_working_date));
    }
}
