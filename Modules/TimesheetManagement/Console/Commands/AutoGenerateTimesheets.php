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
        $workday = !in_array($today->dayOfWeek, [Carbon::SATURDAY, Carbon::SUNDAY]);
        if (!$workday) {
            $this->info('Today is not a workday. Skipping timesheet generation.');
            return 0;
        }

        // Use EmployeeAssignment for all assignment types
        $assignments = EmployeeAssignment::active()->get();
        $created = 0;
        foreach ($assignments as $assignment) {
            $employeeId = $assignment->employee_id;
            $dateStr = $today->toDateString();
            $data = [
                'employee_id' => $employeeId,
                'date' => $dateStr,
                'status' => \Modules\TimesheetManagement\Domain\Models\Timesheet::STATUS_DRAFT,
                'hours_worked' => 0,
                'overtime_hours' => 0,
                'start_time' => '08:00',
                'end_time' => null,
            ];
            if ($assignment->type === 'project' && $assignment->project_id) {
                $data['project_id'] = $assignment->project_id;
            }
            if ($assignment->type === 'rental' && $assignment->rental_id) {
                $data['rental_id'] = $assignment->rental_id;
            }
            // For other types, you may want to add a 'description' or 'location' field
            if (!\Modules\TimesheetManagement\Domain\Models\Timesheet::hasOverlap($employeeId, $dateStr)) {
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
