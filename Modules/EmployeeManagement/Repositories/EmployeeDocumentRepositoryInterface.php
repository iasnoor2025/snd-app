<?php

namespace Modules\EmployeeManagement\Repositories;

use Modules\Core\Repositories\BaseRepositoryInterface;
use Modules\EmployeeManagement\Domain\Models\EmployeeDocument;

interface EmployeeDocumentRepositoryInterface extends BaseRepositoryInterface
{
    public function findByEmployee(int $employeeId): array;
    public function findExpiring(int $daysThreshold = 30): array;
    public function findExpired(): array;
    public function findPendingVerification(): array;
    public function findById(int $id): ?EmployeeDocument;
    public function create(array $data): EmployeeDocument;
    public function update($id, array $data): EmployeeDocument;
    public function delete($id): bool;
}

