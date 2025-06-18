<?php

namespace Modules\EmployeeManagement\Services;

use Modules\EmployeeManagement\Domain\Models\Employee;
use Modules\EmployeeManagement\Domain\Models\SalaryIncrement;
use Modules\Core\Domain\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Exception;

class SalaryIncrementService
{
    /**
     * Create a new salary increment request
     */
    public function createIncrement(array $data, User $requestedBy): SalaryIncrement
    {
        $employee = Employee::findOrFail($data['employee_id']);

        // Get current salary details
        $currentSalary = $this->getCurrentSalaryDetails($employee);

        // Calculate new salary based on increment type
        $newSalaryDetails = $this->calculateNewSalary($currentSalary, $data);

        return SalaryIncrement::create([
            'employee_id' => $employee->id,
            'current_base_salary' => $currentSalary['base_salary'],
            'current_food_allowance' => $currentSalary['food_allowance'],
            'current_housing_allowance' => $currentSalary['housing_allowance'],
            'current_transport_allowance' => $currentSalary['transport_allowance'],
            'new_base_salary' => $newSalaryDetails['base_salary'],
            'new_food_allowance' => $newSalaryDetails['food_allowance'],
            'new_housing_allowance' => $newSalaryDetails['housing_allowance'],
            'new_transport_allowance' => $newSalaryDetails['transport_allowance'],
            'increment_type' => $data['increment_type'],
            'increment_percentage' => $data['increment_percentage'] ?? null,
            'increment_amount' => $data['increment_amount'] ?? null,
            'reason' => $data['reason'],
            'effective_date' => $data['effective_date'],
            'requested_by' => $requestedBy->id,
            'requested_at' => now(),
            'notes' => $data['notes'] ?? null,
        ]);
    }

    /**
     * Get current salary details for an employee
     */
    private function getCurrentSalaryDetails(Employee $employee): array
    {
        // Try to get from current salary relationship first
        $currentSalary = $employee->salaries()
            ->where('status', 'approved')
            ->where('effective_from', '<=', now())
            ->where(function ($query) {
                $query->whereNull('effective_to')
                    ->orWhere('effective_to', '>=', now());
            })
            ->latest('effective_from')
            ->first();

        if ($currentSalary) {
            return [
                'base_salary' => $currentSalary->base_salary,
                'food_allowance' => $currentSalary->food_allowance,
                'housing_allowance' => $currentSalary->housing_allowance,
                'transport_allowance' => $currentSalary->transport_allowance,
            ];
        }

        // Fallback to employee's basic salary
        return [
            'base_salary' => $employee->basic_salary ?? 0,
            'food_allowance' => 0,
            'housing_allowance' => 0,
            'transport_allowance' => 0,
        ];
    }

    /**
     * Calculate new salary based on increment type
     */
    private function calculateNewSalary(array $currentSalary, array $data): array
    {
        $newSalary = $currentSalary;

        switch ($data['increment_type']) {
            case SalaryIncrement::TYPE_PERCENTAGE:
                $percentage = $data['increment_percentage'] / 100;
                $newSalary['base_salary'] = $currentSalary['base_salary'] * (1 + $percentage);

                // Apply percentage to allowances if specified
                if (isset($data['apply_to_allowances']) && $data['apply_to_allowances']) {
                    $newSalary['food_allowance'] = $currentSalary['food_allowance'] * (1 + $percentage);
                    $newSalary['housing_allowance'] = $currentSalary['housing_allowance'] * (1 + $percentage);
                    $newSalary['transport_allowance'] = $currentSalary['transport_allowance'] * (1 + $percentage);
                }
                break;

            case SalaryIncrement::TYPE_AMOUNT:
                $newSalary['base_salary'] = $currentSalary['base_salary'] + $data['increment_amount'];
                break;

            case SalaryIncrement::TYPE_PROMOTION:
            case SalaryIncrement::TYPE_ANNUAL_REVIEW:
            case SalaryIncrement::TYPE_PERFORMANCE:
            case SalaryIncrement::TYPE_MARKET_ADJUSTMENT:
                // For these types, use the provided new salary values
                $newSalary = [
                    'base_salary' => $data['new_base_salary'] ?? $currentSalary['base_salary'],
                    'food_allowance' => $data['new_food_allowance'] ?? $currentSalary['food_allowance'],
                    'housing_allowance' => $data['new_housing_allowance'] ?? $currentSalary['housing_allowance'],
                    'transport_allowance' => $data['new_transport_allowance'] ?? $currentSalary['transport_allowance'],
                ];
                break;
        }

        return $newSalary;
    }

    /**
     * Get salary increments with filters
     */
    public function getIncrements(array $filters = []): LengthAwarePaginator
    {
        $query = SalaryIncrement::with(['employee', 'requestedBy', 'approvedBy', 'rejectedBy']);

        // Apply filters
        if (isset($filters['employee_id'])) {
            $query->where('employee_id', $filters['employee_id']);
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['increment_type'])) {
            $query->where('increment_type', $filters['increment_type']);
        }

        if (isset($filters['effective_date_from'])) {
            $query->where('effective_date', '>=', $filters['effective_date_from']);
        }

        if (isset($filters['effective_date_to'])) {
            $query->where('effective_date', '<=', $filters['effective_date_to']);
        }

        if (isset($filters['requested_by'])) {
            $query->where('requested_by', $filters['requested_by']);
        }

        return $query->latest('created_at')->paginate($filters['per_page'] ?? 15);
    }

    /**
     * Approve a salary increment
     */
    public function approveIncrement(SalaryIncrement $increment, User $approver): SalaryIncrement
    {
        if (!$increment->canBeApproved()) {
            throw new Exception('This salary increment cannot be approved.');
        }

        DB::transaction(function () use ($increment, $approver) {
            $increment->approve($approver);

            // If effective date is today or in the past, apply immediately
            if ($increment->effective_date <= now()->toDateString()) {
                $this->applyIncrement($increment);
            }
        });

        return $increment->fresh();
    }

    /**
     * Reject a salary increment
     */
    public function rejectIncrement(SalaryIncrement $increment, User $rejector, string $reason = null): SalaryIncrement
    {
        if (!$increment->canBeRejected()) {
            throw new Exception('This salary increment cannot be rejected.');
        }

        $increment->reject($rejector, $reason);

        return $increment->fresh();
    }

    /**
     * Apply approved salary increments that are effective today
     */
    public function applyDueIncrements(): Collection
    {
        $dueIncrements = SalaryIncrement::approved()
            ->effectiveToday()
            ->where('status', '!=', SalaryIncrement::STATUS_APPLIED)
            ->get();

        $appliedIncrements = collect();

        foreach ($dueIncrements as $increment) {
            try {
                DB::transaction(function () use ($increment) {
                    $this->applyIncrement($increment);
                });
                $appliedIncrements->push($increment->fresh());
            } catch (Exception $e) {
                // Log error but continue with other increments
                logger()->error('Failed to apply salary increment', [
                    'increment_id' => $increment->id,
                    'employee_id' => $increment->employee_id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        return $appliedIncrements;
    }

    /**
     * Apply a single salary increment
     */
    public function applyIncrement(SalaryIncrement $increment): void
    {
        $increment->apply();
    }

    /**
     * Get salary increment statistics
     */
    public function getStatistics(array $filters = []): array
    {
        $query = SalaryIncrement::query();

        // Apply date filters
        if (isset($filters['from_date'])) {
            $query->where('created_at', '>=', $filters['from_date']);
        }

        if (isset($filters['to_date'])) {
            $query->where('created_at', '<=', $filters['to_date']);
        }

        $baseQuery = clone $query;

        // Calculate total increment amount from the difference between new and current total salaries
        $totalIncrementAmount = (clone $query)->applied()
            ->selectRaw('SUM(new_base_salary + new_food_allowance + new_housing_allowance + new_transport_allowance - current_base_salary - current_food_allowance - current_housing_allowance - current_transport_allowance) as total')
            ->value('total') ?? 0;

        return [
            'total_increments' => $baseQuery->count(),
            'pending_increments' => (clone $query)->pending()->count(),
            'approved_increments' => (clone $query)->approved()->count(),
            'rejected_increments' => (clone $query)->rejected()->count(),
            'applied_increments' => (clone $query)->applied()->count(),
            'total_increment_amount' => $totalIncrementAmount,
            'average_increment_percentage' => (clone $query)->applied()->avg('increment_percentage') ?? 0,
            'by_type' => (clone $query)->applied()
                ->selectRaw('increment_type, COUNT(*) as count, AVG(increment_percentage) as avg_percentage')
                ->groupBy('increment_type')
                ->get()
                ->keyBy('increment_type'),
        ];
    }

    /**
     * Get employee salary history including increments
     */
    public function getEmployeeSalaryHistory(Employee $employee): Collection
    {
        return SalaryIncrement::forEmployee($employee->id)
            ->with(['requestedBy', 'approvedBy'])
            ->latest('effective_date')
            ->get();
    }

    /**
     * Calculate projected annual cost for pending increments
     */
    public function calculateProjectedAnnualCost(): array
    {
        $pendingIncrements = SalaryIncrement::pending()
            ->with('employee')
            ->get();

        $totalAnnualIncrease = 0;
        $incrementsByType = [];

        foreach ($pendingIncrements as $increment) {
            $monthlyIncrease = $increment->total_increment_amount;
            $annualIncrease = $monthlyIncrease * 12;
            $totalAnnualIncrease += $annualIncrease;

            if (!isset($incrementsByType[$increment->increment_type])) {
                $incrementsByType[$increment->increment_type] = [
                    'count' => 0,
                    'total_annual_cost' => 0,
                ];
            }

            $incrementsByType[$increment->increment_type]['count']++;
            $incrementsByType[$increment->increment_type]['total_annual_cost'] += $annualIncrease;
        }

        return [
            'total_pending_requests' => $pendingIncrements->count(),
            'total_annual_increase' => $totalAnnualIncrease,
            'by_type' => $incrementsByType,
        ];
    }
}
