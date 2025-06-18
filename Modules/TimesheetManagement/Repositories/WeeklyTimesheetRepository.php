<?php

namespace Modules\TimesheetManagement\Repositories;

use Modules\TimesheetManagement\Domain\Models\WeeklyTimesheet;
use Modules\Core\Repositories\BaseRepository;
use Illuminate\Support\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class WeeklyTimesheetRepository extends BaseRepository
{
    /**
     * @var WeeklyTimesheet
     */
    protected $model;

    /**
     * WeeklyTimesheetRepository constructor.
     *
     * @param WeeklyTimesheet $model
     */
    public function __construct(WeeklyTimesheet $model)
    {
        parent::__construct($model);
        $this->model = $model;
    }

    /**
     * Get timesheets for a specific employee
     *
     * @param int $employeeId
     * @param array $filters
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getEmployeeTimesheets(int $employeeId, array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = $this->model->where('employee_id', $employeeId);

        // Apply filters
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['start_date'])) {
            $query->where('week_start_date', '>=', $filters['start_date']);
        }

        if (isset($filters['end_date'])) {
            $query->where('week_end_date', '<=', $filters['end_date']);
        }

        if (isset($filters['year'])) {
            $query->whereYear('week_start_date', $filters['year']);
        }

        return $query->with(['approver', 'rejector'])
            ->orderBy('week_start_date', 'desc')
            ->paginate($perPage);
    }

    /**
     * Get timesheets pending approval
     *
     * @param array $filters
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getPendingTimesheets(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = $this->model->where('status', 'submitted');

        // Apply filters
        if (isset($filters['employee_id'])) {
            $query->where('employee_id', $filters['employee_id']);
        }

        if (isset($filters['department_id'])) {
            $query->whereHas('employee', function ($q) use ($filters) {
                $q->where('department_id', $filters['department_id']);
            });
        }

        return $query->with(['employee', 'timeEntries'])
            ->orderBy('submitted_at', 'asc')
            ->paginate($perPage);
    }

    /**
     * Get current timesheet for an employee
     *
     * @param int $employeeId
     * @return WeeklyTimesheet|null
     */
    public function getCurrentTimesheet(int $employeeId): ?WeeklyTimesheet
    {
        $today = Carbon::today();

        return $this->model->where('employee_id', $employeeId)
            ->where('week_start_date', '<=', $today)
            ->where('week_end_date', '>=', $today)
            ->first();
    }

    /**
     * Get or create current timesheet for an employee
     *
     * @param int $employeeId
     * @return WeeklyTimesheet
     */
    public function getOrCreateCurrentTimesheet(int $employeeId): WeeklyTimesheet
    {
        $today = Carbon::today();

        // Calculate week start and end dates
        $weekStartDate = clone $today;
        $weekEndDate = clone $today;

        // Adjust to configured week start (assuming 1 = Monday, 7 = Sunday)
        $configuredWorkDays = config('timesheetmanagement.work_days', [1, 2, 3, 4, 5]);
        $weekStartDay = min($configuredWorkDays);

        // Default to Monday (1) if no work days are configured
        if (empty($configuredWorkDays)) {
            $weekStartDay = 1;
        }

        // Adjust week start date
        if ($weekStartDay === 0) { // Sunday
            $weekStartDate->startOfWeek(Carbon::SUNDAY);
        } else { // Monday - Saturday
            $weekStartDate->startOfWeek();
            $weekStartDate->addDays($weekStartDay - 1);
        }

        // Set week end date to 6 days after start
        $weekEndDate = clone $weekStartDate;
        $weekEndDate->addDays(6);

        // Try to find existing timesheet for this week
        $timesheet = $this->model->where('employee_id', $employeeId)
            ->where('week_start_date', $weekStartDate->toDateString())
            ->first();

        // Create new timesheet if not found
        if (!$timesheet) {
            $timesheet = $this->model->create([
                'employee_id' => $employeeId,
                'week_start_date' => $weekStartDate->toDateString(),
                'week_end_date' => $weekEndDate->toDateString(),
                'status' => 'draft',
            ]);
        }

        return $timesheet;
    }

    /**
     * Count timesheets by status
     *
     * @param array $filters
     * @return array
     */
    public function countTimesheetsByStatus(array $filters = []): array
    {
        $query = $this->model->query();

        // Apply filters
        if (isset($filters['employee_id'])) {
            $query->where('employee_id', $filters['employee_id']);
        }

        if (isset($filters['year'])) {
            $query->whereYear('week_start_date', $filters['year']);
        }

        $counts = [
            'draft' => (clone $query)->where('status', 'draft')->count(),
            'submitted' => (clone $query)->where('status', 'submitted')->count(),
            'approved' => (clone $query)->where('status', 'approved')->count(),
            'rejected' => (clone $query)->where('status', 'rejected')->count(),
        ];

        $counts['total'] = array_sum($counts);

        return $counts;
    }

    /**
     * Get total hours by date range
     *
     * @param int $employeeId
     * @param string $startDate
     * @param string $endDate
     * @return array
     */
    public function getTotalHoursByDateRange(int $employeeId, string $startDate, string $endDate): array
    {
        $timesheets = $this->model->where('employee_id', $employeeId)
            ->where(function($query) use ($startDate, $endDate) {
                $query->where(function($q) use ($startDate, $endDate) {
                    $q->where('week_start_date', '>=', $startDate)
                      ->where('week_start_date', '<=', $endDate);
                })->orWhere(function($q) use ($startDate, $endDate) {
                    $q->where('week_end_date', '>=', $startDate)
                      ->where('week_end_date', '<=', $endDate);
                });
            })
            ->where('status', 'approved')
            ->get();

        $totalHours = 0;
        $regularHours = 0;
        $overtimeHours = 0;

        foreach ($timesheets as $timesheet) {
            $totalHours += $timesheet->total_hours;
            $regularHours += $timesheet->regular_hours;
            $overtimeHours += $timesheet->overtime_hours;
        }

        return [
            'total_hours' => $totalHours,
            'regular_hours' => $regularHours,
            'overtime_hours' => $overtimeHours,
        ];
    }
}




