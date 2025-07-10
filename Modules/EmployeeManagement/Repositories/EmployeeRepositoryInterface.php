<?php

namespace Modules\EmployeeManagement\Repositories;

use Modules\Core\Repositories\BaseRepositoryInterface;
use Modules\EmployeeManagement\Domain\Models\Employee;

interface EmployeeRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Find an employee by their file number
     */
    public function findByFileNumber(string $fileNumber): ?Employee;

    /**
     * Find an employee by their email
     */
    public function findByEmail(string $email): ?Employee;

    /**
     * Find employees by their position
     */
    public function findByPosition(int $positionId): array;

    /**
     * Find active employees
     */
    public function findActive(): array;

    /**
     * Find employees by their status
     */
    public function findByStatus(string $status): array;

    /**
     * Generate the next available file number
     */
    public function generateNextFileNumber(): string;

    /**
     * Get employees with their current salary
     */
    public function getWithCurrentSalary(): array;

    /**
     * Get employees with their recent timesheets
     */
    public function getWithRecentTimesheets(int $limit = 5): array;

    /**
     * Get employees with their pending advances
     */
    public function getWithPendingAdvances(): array;

    /**
     * Get top N employees (by recent creation)
     */
    public function getTopEmployees(int $limit = 3): array;

    /**
     * Get all employees
     */
    public function all(): array;
}

