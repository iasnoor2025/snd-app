<?php

namespace Modules\PayrollManagement\Services;

use Modules\PayrollManagement\Domain\Models\SalaryAdvance;
use Modules\EmployeeManagement\Domain\Models\Employee;
use Illuminate\Support\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

class SalaryAdvanceService
{
    /**
     * Get all salary advances with optional filtering
     */
    public function getAdvances(array $filters = []): LengthAwarePaginator
    {
        $query = SalaryAdvance::with(['employee', 'approvedBy']);

        // Apply filters
        if (isset($filters['employee_id'])) {
            $query->where('employee_id', $filters['employee_id']);
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['date_from'])) {
            $query->whereDate('requested_date', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $query->whereDate('requested_date', '<=', $filters['date_to']);
        }

        if (isset($filters['amount_min'])) {
            $query->where('amount', '>=', $filters['amount_min']);
        }

        if (isset($filters['amount_max'])) {
            $query->where('amount', '<=', $filters['amount_max']);
        }

        return $query->orderBy('requested_date', 'desc')
                    ->paginate($filters['per_page'] ?? 15);
    }

    /**
     * Create a new salary advance request
     */
    public function createAdvance(array $data): SalaryAdvance
    {
        $employee = Employee::findOrFail($data['employee_id']);

        // Validate advance eligibility
        $this->validateAdvanceEligibility($employee, $data['amount']);

        $advance = SalaryAdvance::create([
            'employee_id' => $data['employee_id'],
            'amount' => $data['amount'],
            'reason' => $data['reason'] ?? null,
            'requested_date' => now(),
            'status' => 'pending',
            'repayment_method' => $data['repayment_method'] ?? 'monthly_deduction',
            'installments' => $data['installments'] ?? 1,
            'notes' => $data['notes'] ?? null,
        ]);

        return $advance->load(['employee', 'approvedBy']);
    }

    /**
     * Update salary advance
     */
    public function updateAdvance(SalaryAdvance $advance, array $data): SalaryAdvance
    {
        // Only allow updates for pending advances
        if ($advance->status !== 'pending') {
            throw new \Exception('Only pending advances can be updated');
        }

        $advance->update([
            'amount' => $data['amount'] ?? $advance->amount,
            'reason' => $data['reason'] ?? $advance->reason,
            'repayment_method' => $data['repayment_method'] ?? $advance->repayment_method,
            'installments' => $data['installments'] ?? $advance->installments,
            'notes' => $data['notes'] ?? $advance->notes,
        ]);

        return $advance->fresh(['employee', 'approvedBy']);
    }

    /**
     * Approve a salary advance request
     *
     * @param int $advanceId
     * @param int $approverId
     * @return array
     */
    public function approveAdvance(int $advanceId, int $approverId): array
    {
        try {
            DB::beginTransaction();

            // Update advance status to approved
            $updated = DB::table('salary_advances')
                ->where('id', $advanceId)
                ->update([
                    'status' => 'approved',
                    'approved_date' => now(),
                    'approved_by' => $approverId,
                    'updated_at' => now(),
                ]);

            if (!$updated) {
                DB::rollBack();
                return [
                    'success' => false,
                    'message' => 'Salary advance not found',
                    'data' => null
                ];
            }

            Log::info('Salary advance approved', [
                'advance_id' => $advanceId,
                'approver_id' => $approverId
            ]);

            DB::commit();

            return [
                'success' => true,
                'message' => 'Salary advance approved successfully',
                'data' => [
                    'id' => $advanceId,
                    'status' => 'approved',
                    'approved_date' => now()->toDateString(),
                ]
            ];
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Failed to approve salary advance', ['error' => $e->getMessage()]);

            return [
                'success' => false,
                'message' => 'Failed to approve salary advance',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Reject a salary advance request
     *
     * @param int $advanceId
     * @param int $rejectorId
     * @param string $reason
     * @return array
     */
    public function rejectAdvance(int $advanceId, int $rejectorId, string $reason = ''): array
    {
        try {
            DB::beginTransaction();

            // Update advance status to rejected
            $updated = DB::table('salary_advances')
                ->where('id', $advanceId)
                ->update([
                    'status' => 'rejected',
                    'rejected_date' => now(),
                    'rejected_by' => $rejectorId,
                    'rejection_reason' => $reason,
                    'updated_at' => now(),
                ]);

            if (!$updated) {
                DB::rollBack();
                return [
                    'success' => false,
                    'message' => 'Salary advance not found',
                    'data' => null
                ];
            }

            Log::info('Salary advance rejected', [
                'advance_id' => $advanceId,
                'rejector_id' => $rejectorId,
                'reason' => $reason
            ]);

            DB::commit();

            return [
                'success' => true,
                'message' => 'Salary advance rejected successfully',
                'data' => [
                    'id' => $advanceId,
                    'status' => 'rejected',
                    'rejection_reason' => $reason,
                ]
            ];
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Failed to reject salary advance', ['error' => $e->getMessage()]);

            return [
                'success' => false,
                'message' => 'Failed to reject salary advance',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Process advance payment
     */
    public function processPayment(SalaryAdvance $advance, array $paymentData): SalaryAdvance
    {
        if ($advance->status !== 'approved') {
            throw new \Exception('Only approved advances can be paid');
        }

        $advance->update([
            'status' => 'paid',
            'paid_date' => now(),
            'payment_method' => $paymentData['payment_method'] ?? 'bank_transfer',
            'payment_reference' => $paymentData['payment_reference'] ?? null,
            'payment_notes' => $paymentData['payment_notes'] ?? null,
        ]);

        return $advance->fresh(['employee', 'approvedBy']);
    }

    /**
     * Get employee advances
     */
    public function getEmployeeAdvances(int $employeeId): Collection
    {
        return SalaryAdvance::where('employee_id', $employeeId)
                          ->orderBy('created_at', 'desc')
                          ->get();
    }

    /**
     * Get advance statistics
     */
    public function getAdvanceStatistics(array $filters = []): array
    {
        $query = SalaryAdvance::query();

        // Apply date filters
        if (isset($filters['date_from'])) {
            $query->whereDate('requested_date', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $query->whereDate('requested_date', '<=', $filters['date_to']);
        }

        $advances = $query->get();

        return [
            'total_requests' => $advances->count(),
            'pending_requests' => $advances->where('status', 'pending')->count(),
            'approved_requests' => $advances->where('status', 'approved')->count(),
            'rejected_requests' => $advances->where('status', 'rejected')->count(),
            'paid_requests' => $advances->where('status', 'paid')->count(),
            'total_amount_requested' => $advances->sum('amount'),
            'total_amount_approved' => $advances->where('status', '!=', 'rejected')->sum('approved_amount'),
            'total_amount_paid' => $advances->where('status', 'paid')->sum('approved_amount'),
            'average_advance_amount' => $advances->avg('amount'),
            'approval_rate' => $advances->count() > 0 ?
                ($advances->whereIn('status', ['approved', 'paid'])->count() / $advances->count()) * 100 : 0,
        ];
    }

    /**
     * Validate advance eligibility
     */
    protected function validateAdvanceEligibility(Employee $employee, float $amount): void
    {
        // Check if amount exceeds 50% of monthly salary (including all active advances)
        $monthlySalary = $employee->basic_salary ?? 0;
        $maxAdvanceAmount = $monthlySalary * 0.5; // 50% of monthly salary
        $currentOutstanding = SalaryAdvance::where('employee_id', $employee->id)
            ->whereIn('status', ['pending', 'approved'])
            ->sum('amount');
        if (($currentOutstanding + $amount) > $maxAdvanceAmount) {
            throw new \Exception("Total advance amount cannot exceed 50% of monthly salary (Max: {$maxAdvanceAmount})");
        }

        // Optionally relax employment duration check
        // $employmentDuration = $employee->joining_date ?
        //     Carbon::parse($employee->joining_date)->diffInMonths(now()) : 0;
        // if ($employmentDuration < 3) {
        //     throw new \Exception('Employee must complete at least 3 months of employment to request advance');
        // }
    }

    /**
     * Create repayment schedule
     */
    protected function createRepaymentSchedule(SalaryAdvance $advance): void
    {
        // This would create a repayment schedule based on installments
        // For now, we'll just add a note that repayment schedule is created
        $advance->update([
            'repayment_schedule_created' => true,
            'next_deduction_date' => now()->addMonth(),
        ]);
    }

    /**
     * Calculate monthly deduction amount
     */
    public function calculateMonthlyDeduction(SalaryAdvance $advance): float
    {
        if ($advance->status !== 'paid' || !$advance->installments) {
            return 0;
        }

        return $advance->approved_amount / $advance->installments;
    }

    /**
     * Get advances due for deduction
     */
    public function getAdvancesDueForDeduction(): Collection
    {
        return SalaryAdvance::where('status', 'paid')
                          ->where('repayment_method', 'monthly_deduction')
                          ->whereDate('next_deduction_date', '<=', now())
                          ->with(['employee'])
                          ->get();
    }

    /**
     * Create a new salary advance request
     *
     * @param array $data
     * @return array
     */
    public function createAdvanceRequest(array $data): array
    {
        try {
            DB::beginTransaction();

            // Create the salary advance record
            $advanceId = DB::table('salary_advances')->insertGetId([
                'employee_id' => $data['employee_id'],
                'amount' => $data['amount'],
                'reason' => $data['reason'] ?? null,
                'repayment_months' => $data['repayment_months'] ?? 12,
                'monthly_deduction' => $data['amount'] / ($data['repayment_months'] ?? 12),
                'remaining_balance' => $data['amount'],
                'status' => 'pending',
                'requested_date' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::commit();

            Log::info('Salary advance request created', ['advance_id' => $advanceId]);

            return [
                'success' => true,
                'data' => [
                    'id' => $advanceId,
                    'employee_id' => $data['employee_id'],
                    'amount' => $data['amount'],
                    'status' => 'pending',
                    'monthly_deduction' => $data['amount'] / ($data['repayment_months'] ?? 12),
                ],
                'message' => 'Salary advance request created successfully'
            ];
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Failed to create salary advance request', ['error' => $e->getMessage()]);

            return [
                'success' => false,
                'message' => 'Failed to create salary advance request',
                'error' => $e->getMessage()
            ];
        }
    }
}
