<?php

namespace Modules\EmployeeManagement\Repositories;

use Carbon\Carbon;
use Modules\Core\Repositories\BaseRepository;
use Modules\EmployeeManagement\Domain\Models\EmployeeAdvance;

class EmployeeAdvanceRepository extends BaseRepository implements EmployeeAdvanceRepositoryInterface
{
    public function __construct(EmployeeAdvance $model)
    {
        parent::__construct($model);
    }

    public function findByEmployee(int $employeeId): array
    {
        return $this->model
            ->where('employee_id', $employeeId)
            ->with(['employee', 'approver', 'rejecter'])
            ->get()
            ->toArray();
    }

    public function findPending(): array
    {
        return $this->model
            ->where('status', 'pending')
            ->with(['employee', 'approver', 'rejecter'])
            ->get()
            ->toArray();
    }

    public function findActive(): array
    {
        return $this->model
            ->where('status', 'approved')
            ->where('remaining_amount', '>', 0)
            ->with(['employee', 'approver', 'rejecter'])
            ->get()
            ->toArray();
    }

    public function findUpcomingDeductions(): array
    {
        $today = Carbon::now()->startOfDay();
        $nextWeek = Carbon::now()->addWeek()->endOfDay();

        return $this->model
            ->where('status', 'approved')
            ->where('remaining_amount', '>', 0)
            ->whereNotNull('deduction_start_date')
            ->where('deduction_start_date', '>=', $today)
            ->where('deduction_start_date', '<=', $nextWeek)
            ->with(['employee', 'approver', 'rejecter'])
            ->get()
            ->toArray();
    }

    public function findOverdueDeductions(): array
    {
        $today = Carbon::now()->startOfDay();

        return $this->model
            ->where('status', 'approved')
            ->where('remaining_amount', '>', 0)
            ->whereNotNull('deduction_start_date')
            ->where('deduction_start_date', '<', $today)
            ->with(['employee', 'approver', 'rejecter'])
            ->get()
            ->toArray();
    }

    public function findById(int $id): ?EmployeeAdvance
    {
        return $this->model
            ->with(['employee', 'approver', 'rejecter'])
            ->find($id);
    }

    // Inherited create, update, delete methods from BaseRepository

    public function __call(
        $method, $parameters
    ) {
        throw new \Exception('This repository is deprecated. Use PayrollManagement AdvancePayment logic.');
    }
}


