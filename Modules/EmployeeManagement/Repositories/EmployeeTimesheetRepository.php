<?php

namespace Modules\EmployeeManagement\Repositories;

use Modules\Core\Repositories\BaseRepository;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Modules\EmployeeManagement\Domain\Models\EmployeeTimesheet;

class EmployeeTimesheetRepository extends BaseRepository implements EmployeeTimesheetRepositoryInterface
{
    public function __construct(EmployeeTimesheet $model)
    {
        parent::__construct($model);
    }

    public function findByEmployee(int $employeeId): array
    {
        return $this->model->where('employee_id', $employeeId)
            ->latest('date')
            ->get()
            ->all();
    }

    public function findByDateRange(int $employeeId, Carbon $startDate, Carbon $endDate): array
    {
        return $this->model->where('employee_id', $employeeId)
            ->whereBetween('date', [$startDate->toDateString(), $endDate->toDateString()])
            ->latest('date')
            ->get()
            ->all();
    }

    public function findByStatus(string $status): array
    {
        return $this->model->where('status', $status)
            ->latest('date')
            ->get()
            ->all();
    }

    public function getPendingApproval(): array
    {
        return $this->model->where('status', 'pending')
            ->with(['employee', 'employee.position'])
            ->latest('date')
            ->get()
            ->all();
    }

    public function getApprovedByDateRange(Carbon $startDate, Carbon $endDate): array
    {
        return $this->model->where('status', 'approved')
            ->whereBetween('date', [$startDate->toDateString(), $endDate->toDateString()])
            ->with(['employee', 'employee.position', 'approver'])
            ->latest('date')
            ->get()
            ->all();
    }

    public function getForPayrollCalculation(Carbon $startDate, Carbon $endDate): array
    {
        return $this->model->where('status', 'approved')
            ->whereBetween('date', [$startDate->toDateString(), $endDate->toDateString()])
            ->with(['employee'])
            ->latest('date')
            ->get()
            ->all();
    }

    public function getOvertimeHours(int $employeeId, Carbon $startDate, Carbon $endDate): float
    {
        return (float) $this->model->where('employee_id', $employeeId)
            ->where('status', 'approved')
            ->whereBetween('date', [$startDate->toDateString(), $endDate->toDateString()])
            ->sum('overtime_hours');
    }

    public function getRegularHours(int $employeeId, Carbon $startDate, Carbon $endDate): float
    {
        return (float) $this->model->where('employee_id', $employeeId)
            ->where('status', 'approved')
            ->whereBetween('date', [$startDate->toDateString(), $endDate->toDateString()])
            ->sum('regular_hours');
    }

    public function approve(int $id, int $approverId): EmployeeTimesheet
    {
        return DB::transaction(function () use ($id, $approverId) {
            $timesheet = $this->model->findOrFail($id);
            $timesheet->status = 'approved';
            $timesheet->approved_by = $approverId;
            $timesheet->approved_at = now();
            $timesheet->save();
            return $timesheet;
        });
    }

    public function reject(int $id, ?string $reason = null): EmployeeTimesheet
    {
        return DB::transaction(function () use ($id, $reason) {
            $timesheet = $this->model->findOrFail($id);
            $timesheet->status = 'rejected';
            $timesheet->notes = $reason ?: $timesheet->notes;
            $timesheet->save();
            return $timesheet;
        });
    }
}


