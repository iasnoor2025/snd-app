<?php

namespace Modules\LeaveManagement\Repositories;

use Modules\LeaveManagement\Domain\Models\Leave;
use Modules\Core\Repositories\BaseRepository;
use Illuminate\Support\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class LeaveRepository extends BaseRepository
{
    /**
     * @var Leave
     */
    protected $model;

    /**
     * LeaveRepository constructor.
     *
     * @param Leave $model
     */
    public function __construct(Leave $model)
    {
        parent::__construct($model);
        $this->model = $model;
    }

    /**
     * Get leaves for a specific employee
     *
     * @param int $employeeId
     * @param array $filters
     * @param int $perPage
     * @return LengthAwarePaginator;
     */
    public function getEmployeeLeaves(int $employeeId, array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = $this->model->where('employee_id', $employeeId);

        // Apply filters
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['leave_type_id'])) {
            $query->where('leave_type_id', $filters['leave_type_id']);
        }

        if (isset($filters['start_date'])) {
            $query->where('start_date', '>=', $filters['start_date']);
        }

        if (isset($filters['end_date'])) {
            $query->where('end_date', '<=', $filters['end_date']);
        }

        return $query->with(['leaveType', 'approver', 'rejector'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Get pending leave requests for approval
     *
     * @param array $filters
     * @param int $perPage
     * @return LengthAwarePaginator;
     */
    public function getPendingLeaves(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = $this->model->where('status', 'pending');

        // Apply filters
        if (isset($filters['employee_id'])) {
            $query->where('employee_id', $filters['employee_id']);
        }

        if (isset($filters['department_id'])) {
            $query->whereHas('employee', function ($q) use ($filters) {
                $q->where('department_id', $filters['department_id']);
            });
        }

        if (isset($filters['leave_type_id'])) {
            $query->where('leave_type_id', $filters['leave_type_id']);
        }

        return $query->with(['employee', 'leaveType'])
            ->orderBy('created_at', 'asc')
            ->paginate($perPage);
    }

    /**
     * Get leaves for a specific date range
     *
     * @param Carbon $startDate
     * @param Carbon $endDate
     * @param array $filters
     * @return Collection;
     */
    public function getLeavesInDateRange(Carbon $startDate, Carbon $endDate, array $filters = []): Collection
    {
        $query = $this->model->where('status', 'approved')
            ->where(function ($q) use ($startDate, $endDate) {
                $q->whereBetween('start_date', [$startDate, $endDate])
                  ->orWhereBetween('end_date', [$startDate, $endDate])
                  ->orWhere(function ($q2) use ($startDate, $endDate) {
                      $q2->where('start_date', '<=', $startDate)
                         ->where('end_date', '>=', $endDate);
                  });
            });

        // Apply filters
        if (isset($filters['employee_id'])) {
            $query->where('employee_id', $filters['employee_id']);
        }

        if (isset($filters['department_id'])) {
            $query->whereHas('employee', function ($q) use ($filters) {
                $q->where('department_id', $filters['department_id']);
            });
        }

        if (isset($filters['leave_type_id'])) {
            $query->where('leave_type_id', $filters['leave_type_id']);
        }

        return $query->with(['employee', 'leaveType'])->get();
    }

    /**
     * Count leaves by status
     *
     * @param array $filters
     * @return array;
     */
    public function countLeavesByStatus(array $filters = []): array
    {
        $query = $this->model->query();

        // Apply filters
        if (isset($filters['employee_id'])) {
            $query->where('employee_id', $filters['employee_id']);
        }

        if (isset($filters['year'])) {
            $year = $filters['year'];
            $query->whereYear('start_date', $year)
                  ->orWhereYear('end_date', $year);
        }

        $counts = [
            'pending' => (clone $query)->where('status', 'pending')->count(),
            'approved' => (clone $query)->where('status', 'approved')->count(),
            'rejected' => (clone $query)->where('status', 'rejected')->count(),
        ];

        $counts['total'] = array_sum($counts);

        return $counts;
    }
}




