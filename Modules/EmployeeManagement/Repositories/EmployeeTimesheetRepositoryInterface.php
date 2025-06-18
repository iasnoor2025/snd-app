<?php

namespace Modules\EmployeeManagement\Repositories;

use Modules\Core\Repositories\BaseRepositoryInterface;
use Carbon\Carbon;
use Modules\EmployeeManagement\Domain\Models\EmployeeTimesheet;

interface EmployeeTimesheetRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Find timesheets by employee ID
     *
     * @param int $employeeId
     * @return array
     */
    public function findByEmployee(int $employeeId): array;

    /**
     * Find timesheets for a specific date range
     *
     * @param int $employeeId
     * @param Carbon $startDate
     * @param Carbon $endDate
     * @return array
     */
    public function findByDateRange(int $employeeId, Carbon $startDate, Carbon $endDate): array;

    /**
     * Find timesheets by status
     *
     * @param string $status
     * @return array
     */
    public function findByStatus(string $status): array;

    /**
     * Get pending timesheets for approval
     *
     * @return array
     */
    public function getPendingApproval(): array;

    /**
     * Get approved timesheets for a date range
     *
     * @param Carbon $startDate
     * @param Carbon $endDate
     * @return array
     */
    public function getApprovedByDateRange(Carbon $startDate, Carbon $endDate): array;

    /**
     * Get timesheets for payroll calculation
     *
     * @param Carbon $startDate
     * @param Carbon $endDate
     * @return array
     */
    public function getForPayrollCalculation(Carbon $startDate, Carbon $endDate): array;

    /**
     * Get employee overtime hours for a date range
     *
     * @param int $employeeId
     * @param Carbon $startDate
     * @param Carbon $endDate
     * @return float
     */
    public function getOvertimeHours(int $employeeId, Carbon $startDate, Carbon $endDate): float;

    /**
     * Get employee regular hours for a date range
     *
     * @param int $employeeId
     * @param Carbon $startDate
     * @param Carbon $endDate
     * @return float
     */
    public function getRegularHours(int $employeeId, Carbon $startDate, Carbon $endDate): float;

    /**
     * Approve a timesheet
     *
     * @param int $id
     * @param int $approverId
     * @return EmployeeTimesheet
     */
    public function approve(int $id, int $approverId): EmployeeTimesheet;

    /**
     * Reject a timesheet
     *
     * @param int $id
     * @param string|null $reason
     * @return EmployeeTimesheet
     */
    public function reject(int $id, ?string $reason = null): EmployeeTimesheet;
}


