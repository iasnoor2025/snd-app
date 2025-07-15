<?php

namespace Modules\EmployeeManagement\Services;

use Modules\Core\Services\BaseService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Modules\Core\Domain\Models\User;
use Modules\EmployeeManagement\Domain\Models\Employee;
use Modules\EmployeeManagement\Domain\Models\EmployeeAdvance;
use Modules\EmployeeManagement\Repositories\EmployeeAdvanceRepositoryInterface;

class EmployeeAdvanceService extends BaseService
{
    private EmployeeAdvanceRepositoryInterface $advanceRepository;

    public function __construct(EmployeeAdvanceRepositoryInterface $advanceRepository)
    {
        $this->advanceRepository = $advanceRepository;
    }

    public function requestAdvance(int $employeeId, array $data): EmployeeAdvance
    {
        try {
            DB::beginTransaction();

            $advance = $this->advanceRepository->create([
                'employee_id' => $employeeId,
                'amount' => $data['amount'],
                'reason' => $data['reason'],
                'status' => 'pending',
                'payment_date' => $data['payment_date'] ?? null,
                'deduction_start_date' => $data['deduction_start_date'] ?? null,
                'deduction_end_date' => $data['deduction_end_date'] ?? null,
                'deduction_amount' => $data['deduction_amount'] ?? null,
                'deduction_frequency' => $data['deduction_frequency'] ?? null,
                'remaining_amount' => $data['amount'],
                'notes' => $data['notes'] ?? null
            ]);

            DB::commit();
            return $advance;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to request advance: ' . $e->getMessage());
            throw $e;
        }
    }

    public function approveAdvance(int $advanceId, User $approver, ?string $notes = null): EmployeeAdvance
    {
        try {
            DB::beginTransaction();

            $advance = $this->advanceRepository->update($advanceId, [
                'status' => 'approved',
                'approved_by' => $approver->id,
                'approved_at' => now(),
                'notes' => $notes,
            ]);

            DB::commit();
            return $advance;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to approve advance: ' . $e->getMessage());
            throw $e;
        }
    }

    public function rejectAdvance(int $advanceId, User $rejecter, string $reason): EmployeeAdvance
    {
        try {
            DB::beginTransaction();

            $advance = $this->advanceRepository->update($advanceId, [
                'status' => 'rejected',
                'rejected_by' => $rejecter->id,
                'rejected_at' => now(),
                'rejection_reason' => $reason,
            ]);

            DB::commit();
            return $advance;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to reject advance: ' . $e->getMessage());
            throw $e;
        }
    }

    public function processDeduction(int $advanceId, float $amount): EmployeeAdvance
    {
        try {
            DB::beginTransaction();

            $advance = $this->advanceRepository->find($advanceId);

            if ($advance->remaining_amount < $amount) {
                throw new \Exception('Deduction amount exceeds remaining advance amount');
            }

            $advance = $this->advanceRepository->update($advanceId, [
                'remaining_amount' => $advance->remaining_amount - $amount
            ]);

            DB::commit();
            return $advance;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to process deduction: ' . $e->getMessage());
            throw $e;
        }
    }

    public function getEmployeeAdvances(int $employeeId): array
    {
        return $this->advanceRepository->findByEmployee($employeeId);
    }

    public function getPendingAdvances(): array
    {
        return $this->advanceRepository->findPending();
    }

    public function getActiveAdvances(): array
    {
        return $this->advanceRepository->findActive();
    }

    public function getUpcomingDeductions(): array
    {
        return $this->advanceRepository->findUpcomingDeductions();
    }

    public function getOverdueDeductions(): array
    {
        return $this->advanceRepository->findOverdueDeductions();
    }

    public function calculateDeductionSchedule(EmployeeAdvance $advance): array
    {
        if (!$advance->deduction_amount || !$advance->deduction_frequency || !$advance->deduction_start_date) {
            return [];
        }

        $schedule = [];
        $remainingAmount = $advance->amount;
        $currentDate = $advance->deduction_start_date;

        while ($remainingAmount > 0 && (!$advance->deduction_end_date || $currentDate <= $advance->deduction_end_date)) {
            $deductionAmount = min($advance->deduction_amount, $remainingAmount);
            $schedule[] = [
                'date' => $currentDate->format('Y-m-d'),
                'amount' => $deductionAmount,
            ];

            $remainingAmount -= $deductionAmount;

            switch ($advance->deduction_frequency) {
                case 'weekly':
                    $currentDate = $currentDate->addWeek();
                    break;
                case 'biweekly':
                    $currentDate = $currentDate->addWeeks(2);
                    break;
                case 'monthly':
                    $currentDate = $currentDate->addMonth();
                    break;
            }
        }

        return $schedule;
    }

    public function __call(
        $method, $parameters
    ) {
        throw new \Exception('This service is deprecated. Use PayrollManagement AdvancePayment logic.');
    }
}


