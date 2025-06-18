<?php

namespace Modules\EmployeeManagement\Services;

use Modules\Core\Services\BaseService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Modules\Core\Domain\Models\User;
use Modules\EmployeeManagement\Domain\Models\EmployeeTimesheet;
use Modules\EmployeeManagement\Repositories\EmployeeRepositoryInterface;
use Modules\EmployeeManagement\Repositories\EmployeeTimesheetRepositoryInterface;
use Modules\Project\Repositories\ProjectRepositoryInterface;

class EmployeeTimesheetService extends BaseService
{
    protected EmployeeTimesheetRepositoryInterface $timesheetRepository;
    protected EmployeeRepositoryInterface $employeeRepository;
    protected ?ProjectRepositoryInterface $projectRepository;

    public function __construct(
        EmployeeTimesheetRepositoryInterface $timesheetRepository,
        EmployeeRepositoryInterface $employeeRepository,
        ?ProjectRepositoryInterface $projectRepository = null
    ) {
        $this->timesheetRepository = $timesheetRepository;
        $this->employeeRepository = $employeeRepository;
        $this->projectRepository = $projectRepository;
    }

    public function createTimesheet(array $data): EmployeeTimesheet
    {
        try {
            DB::beginTransaction();

            // Calculate hours if clock in/out provided
            if (isset($data['clock_in']) && isset($data['clock_out'])) {
                $data = $this->calculateHours($data);
            }

            // Set default status to pending
            if (!isset($data['status'])) {
                $data['status'] = 'pending';
            }

            $timesheet = $this->timesheetRepository->create($data);

            // Link to project if project_id is provided and project repository is available
            if ($this->projectRepository && isset($data['project_id'])) {
                $this->linkTimesheetToProject($timesheet, $data['project_id']);
            }

            DB::commit();
            return $timesheet;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create timesheet: ' . $e->getMessage());
            throw $e;
        }
    }

    public function updateTimesheet(int $id, array $data): EmployeeTimesheet
    {
        try {
            DB::beginTransaction();

            // Calculate hours if clock in/out provided
            if (isset($data['clock_in']) && isset($data['clock_out'])) {
                $data = $this->calculateHours($data);
            }

            $timesheet = $this->timesheetRepository->update($id, $data);

            // Update project link if project_id is provided and project repository is available
            if ($this->projectRepository && isset($data['project_id'])) {
                $this->linkTimesheetToProject($timesheet, $data['project_id']);
            }

            DB::commit();
            return $timesheet;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to update timesheet: ' . $e->getMessage());
            throw $e;
        }
    }

    public function deleteTimesheet(int $id): bool
    {
        try {
            DB::beginTransaction();
            $result = $this->timesheetRepository->delete($id);
            DB::commit();
            return $result;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to delete timesheet: ' . $e->getMessage());
            throw $e;
        }
    }

    public function approveTimesheet(int $id, User $approver): EmployeeTimesheet
    {
        try {
            DB::beginTransaction();
            $timesheet = $this->timesheetRepository->approve($id, $approver->id);
            DB::commit();
            return $timesheet;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to approve timesheet: ' . $e->getMessage());
            throw $e;
        }
    }

    public function rejectTimesheet(int $id, ?string $reason = null): EmployeeTimesheet
    {
        try {
            DB::beginTransaction();
            $timesheet = $this->timesheetRepository->reject($id, $reason);
            DB::commit();
            return $timesheet;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to reject timesheet: ' . $e->getMessage());
            throw $e;
        }
    }

    public function bulkApprove(array $ids, User $approver): array
    {
        try {
            DB::beginTransaction();

            $timesheets = [];
            foreach ($ids as $id) {
                $timesheets[] = $this->timesheetRepository->approve($id, $approver->id);
            }

            DB::commit();
            return $timesheets;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to bulk approve timesheets: ' . $e->getMessage());
            throw $e;
        }
    }

    public function getEmployeeTimesheets(int $employeeId): array
    {
        return $this->timesheetRepository->findByEmployee($employeeId);
    }

    public function getTimesheetsByDateRange(int $employeeId, Carbon $startDate, Carbon $endDate): array
    {
        return $this->timesheetRepository->findByDateRange($employeeId, $startDate, $endDate);
    }

    public function getPendingTimesheets(): array
    {
        return $this->timesheetRepository->getPendingApproval();
    }

    public function getApprovedTimesheets(Carbon $startDate, Carbon $endDate): array
    {
        return $this->timesheetRepository->getApprovedByDateRange($startDate, $endDate);
    }

    public function getTimesheetsForPayroll(Carbon $startDate, Carbon $endDate): array
    {
        return $this->timesheetRepository->getForPayrollCalculation($startDate, $endDate);
    }

    public function getTotalHours(int $employeeId, Carbon $startDate, Carbon $endDate): array
    {
        $regularHours = $this->timesheetRepository->getRegularHours($employeeId, $startDate, $endDate);
        $overtimeHours = $this->timesheetRepository->getOvertimeHours($employeeId, $startDate, $endDate);

        return [
            'regular_hours' => $regularHours,
            'overtime_hours' => $overtimeHours,
            'total_hours' => $regularHours + $overtimeHours
        ];
    }

    protected function calculateHours(array $data): array
    {
        $clockIn = Carbon::parse($data['clock_in']);
        $clockOut = Carbon::parse($data['clock_out']);

        // Calculate break duration
        $breakDuration = 0;
        if (isset($data['break_start']) && isset($data['break_end'])) {
            $breakStart = Carbon::parse($data['break_start']);
            $breakEnd = Carbon::parse($data['break_end']);
            $breakDuration = $breakEnd->diffInMinutes($breakStart) / 60;
        }

        // Calculate total hours
        $totalHours = $clockOut->diffInMinutes($clockIn) / 60;
        $totalHours -= $breakDuration;

        // Calculate regular and overtime hours
        $regularHoursLimit = config('employee.regular_hours_limit', 8);
        $regularHours = min($totalHours, $regularHoursLimit);
        $overtimeHours = max(0, $totalHours - $regularHoursLimit);

        // Update data array with calculated values
        $data['total_hours'] = round($totalHours, 2);
        $data['regular_hours'] = round($regularHours, 2);
        $data['overtime_hours'] = round($overtimeHours, 2);

        return $data;
    }

    protected function linkTimesheetToProject(EmployeeTimesheet $timesheet, int $projectId): void
    {
        if (!$this->projectRepository) {
            return;
        }

        try {
            // Logic to link timesheet to project
            // This implementation would depend on how the Project module is structured
            // For now, we'll just make a note that this would need to be completed
            Log::info("Linking timesheet {$timesheet->id} to project {$projectId}");
        } catch (\Exception $e) {
            Log::error("Failed to link timesheet to project: {$e->getMessage()}");
        }
    }

    public function validateTimesheetPeriod(int $employeeId, Carbon $date, ?Carbon $clockIn = null, ?Carbon $clockOut = null): bool
    {
        // Check if employee already has a timesheet for this date
        $existingTimesheets = $this->timesheetRepository->findByDateRange($employeeId, $date, $date);

        // If no timesheets for this date, it's valid
        if (empty($existingTimesheets)) {
            return true;
        }

        // If we're not checking times, just date, and there's an existing timesheet, it's invalid
        if (!$clockIn || !$clockOut) {
            return false;
        }

        // Check if the new time period overlaps with any existing timesheet
        foreach ($existingTimesheets as $existingTimesheet) {
            if ($this->periodsOverlap(
                $clockIn,
                $clockOut,
                Carbon::parse($existingTimesheet->clock_in),
                Carbon::parse($existingTimesheet->clock_out)
            )) {
                return false;
            }
        }

        return true;
    }

    protected function periodsOverlap(Carbon $start1, Carbon $end1, Carbon $start2, Carbon $end2): bool
    {
        return $start1 < $end2 && $start2 < $end1;
    }
}

