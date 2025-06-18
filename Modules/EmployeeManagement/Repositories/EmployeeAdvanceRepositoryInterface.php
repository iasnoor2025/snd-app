<?php

namespace Modules\EmployeeManagement\Repositories;

use Modules\Core\Repositories\BaseRepositoryInterface;
use Modules\EmployeeManagement\Domain\Models\EmployeeAdvance;

interface EmployeeAdvanceRepositoryInterface extends BaseRepositoryInterface
{
    public function findByEmployee(int $employeeId): array;
    public function findPending(): array;
    public function findActive(): array;
    public function findUpcomingDeductions(): array;
    public function findOverdueDeductions(): array;
    public function findById(int $id): ?EmployeeAdvance;
}

