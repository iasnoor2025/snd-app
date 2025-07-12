<?php

namespace Modules\TimesheetManagement\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Modules\EmployeeManagement\Domain\Models\Employee;
use Modules\ProjectManagement\Domain\Models\Project;
use Modules\RentalManagement\Domain\Models\Rental;
use Modules\TimesheetManagement\Domain\Models\Timesheet;
use Modules\EmployeeManagement\Domain\Models\EmployeeAssignment;

class AutoGenerateTimesheets extends Command
{
    protected $signature = 'timesheets:auto-generate';
    protected $description = 'Auto-generate daily timesheet entries for employees assigned to rentals or projects.';

    public function handle()
    {
        $today = Carbon::today();
        $assignments = EmployeeAssignment::query()->whereNull('deleted_at')->get(); // Only non-deleted assignments
        $created = 0;
        foreach ($assignments as $assignment) {
            $employeeId = $assignment->employee_id;
            if (!$assignment->start_date) {
                Log::warning('Assignment skipped: missing start_date', ['assignment_id' => $assignment->id]);
                continue;
            }
            $start = Carbon::parse($assignment->start_date);
            $end = $assignment->end_date ? Carbon::parse($assignment->end_date) : $today;
            if ($end->greaterThan($today)) {
                $end = $today;
            }
            $period = new \DatePeriod(
                new \DateTime($start->toDateString()),
                new \DateInterval('P1D'),
                (new \DateTime($end->toDateString()))->modify('+1 day')
            );
            foreach ($period as $date) {
                $dateStr = $date->format('Y-m-d');
                if (Carbon::parse($dateStr)->greaterThan($today)) {
                    continue;
                }
                // Ignore soft-deleted timesheets when checking for overlap
                $overlap = \Modules\TimesheetManagement\Domain\Models\Timesheet::withTrashed()
                    ->where('employee_id', $employeeId)
                    ->whereDate('date', $dateStr)
                    ->exists();
                if ($overlap) {
                    Log::info('Timesheet skipped: already exists (including trashed)', [
                        'employee_id' => $employeeId,
                        'date' => $dateStr,
                        'assignment_id' => $assignment->id,
                    ]);
                    continue;
                }
                if (Carbon::parse($dateStr)->dayOfWeek === Carbon::FRIDAY) {
                    // Friday: overtime
                    $data = [
                        'employee_id' => $employeeId,
                        'date' => $dateStr,
                        'status' => \Modules\TimesheetManagement\Domain\Models\Timesheet::STATUS_DRAFT,
                        'hours_worked' => 0,
                        'overtime_hours' => 8,
                        'start_time' => '08:00',
                        'end_time' => null,
                    ];
                } else {
                    // Saturday–Thursday: regular workday
                    $data = [
                        'employee_id' => $employeeId,
                        'date' => $dateStr,
                        'status' => \Modules\TimesheetManagement\Domain\Models\Timesheet::STATUS_DRAFT,
                        'hours_worked' => 8,
                        'overtime_hours' => 0,
                        'start_time' => '08:00',
                        'end_time' => null,
                    ];
                }
                if ($assignment->type === 'project' && $assignment->project_id) {
                    $data['project_id'] = $assignment->project_id;
                }
                if ($assignment->type === 'rental' && $assignment->rental_id) {
                    $data['rental_id'] = $assignment->rental_id;
                }
                \Modules\TimesheetManagement\Domain\Models\Timesheet::create($data);
                $created++;
                Log::info('Auto-generated timesheet', [
                    'employee_id' => $employeeId,
                    'date' => $dateStr,
                    'assignment_id' => $assignment->id,
                ]);
            }
        }
        $this->info("Auto-generation of timesheets completed. Created: {$created}");
        return 0;
    }

    private function createTimesheet($employee, $date, $rentalId = null, $projectId = null)
    {
        if (!$employee || !$employee->id) {
            return;
        }
        $exists = Timesheet::where('employee_id', $employee->id)
            ->where('date', $date)
            ->when($rentalId, fn($q) => $q->where('rental_id', $rentalId))
            ->when($projectId, fn($q) => $q->where('project_id', $projectId))
            ->exists();
        if ($exists) {
            return;
        }
        Timesheet::create([
            'employee_id' => $employee->id,
            'date' => $date,
            'rental_id' => $rentalId,
            'project_id' => $projectId,
            'status' => 'pending',
            'hours_worked' => 0,
            'overtime_hours' => 0,
            'start_time' => '08:00',
            'end_time' => null,
        ]);
        Log::info('Auto-generated timesheet', [
            'employee_id' => $employee->id,
            'date' => $date,
            'rental_id' => $rentalId,
            'project_id' => $projectId,
        ]);
    }
}
