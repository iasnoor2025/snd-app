<?php

namespace Modules\EmployeeManagement\Repositories;

use Modules\Core\Repositories\BaseRepository;
use Illuminate\Support\Facades\DB;
use Modules\EmployeeManagement\Domain\Models\Employee;

class EmployeeRepository extends BaseRepository implements EmployeeRepositoryInterface
{
    public function __construct(Employee $model)
    {
        parent::__construct($model);
    }

    public function findByFileNumber(string $fileNumber): ?Employee
    {
        return $this->model->where('file_number', $fileNumber)->first();
    }

    public function findByEmail(string $email): ?Employee
    {
        return $this->model->where('email', $email)->first();
    }

    public function findByPosition(int $positionId): array
    {
        return $this->model->where('position_id', $positionId)->get()->all();
    }

    public function findActive(): array
    {
        return $this->model->where('status', 'active')->get()->all();
    }

    public function findByStatus(string $status): array
    {
        return $this->model->where('status', $status)->get()->all();
    }

    public function generateNextFileNumber(): string
    {
        return DB::transaction(function () {
            $lastEmployee = $this->model->lockForUpdate()
                ->orderBy('file_number', 'desc')
                ->first();

            $lastNumber = $lastEmployee && $lastEmployee->file_number
                ? (int) substr($lastEmployee->file_number, 4)
                : 0;

            return 'EMP-' . str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        });
    }

    public function getWithCurrentSalary(): array
    {
        return $this->model->with(['salaryHistory' => function ($query) {
            $query->where('effective_from', '<=', now())
                ->orderBy('effective_from', 'desc')
                ->limit(1);
        }])->get()->all();
    }

    public function getWithRecentTimesheets(int $limit = 5): array
    {
        return $this->model->with(['timesheets' => function ($query) use ($limit) {
            $query->latest()->limit($limit);
        }])->get()->all();
    }

    public function getWithPendingAdvances(): array
    {
        return $this->model->with(['advancePayments' => function ($query) {
            $query->where('status', 'pending');
        }])->get()->all();
    }

    public function getTopEmployees(int $limit = 3): array
    {
        return $this->model->orderByDesc('created_at')->limit($limit)->get()->all();
    }

    /**
     * Get all employees (only active and truly unassigned: not in any project or rental)
     */
    public function all(): array
    {
        return $this->model
            ->where('status', 'active')
            ->whereDoesntHave('projectManpower')
            ->whereDoesntHave('rentalAssignments')
            ->whereDoesntHave('rentalItems')
            ->get()
            ->toArray();
    }

    public function findWith(array $relations, $id)
    {
        // Validate ID is numeric before querying
        if (!is_numeric($id)) {
            return null;
        }
        return $this->model->with($relations)->find($id);
    }
}


