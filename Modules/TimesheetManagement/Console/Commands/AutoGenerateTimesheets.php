<?php

namespace Modules\TimesheetManagement\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Modules\EmployeeManagement\Domain\Models\Employee;
use Modules\ProjectManagement\Domain\Models\Project;
use Modules\RentalManagement\Domain\Models\Rental;
use Modules\TimesheetManagement\Domain\Models\Timesheet;

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

        // Rentals
        $rentals = Rental::where('status', 'active')
            ->whereDate('start_date', '<=', $today)
            ->whereDate('expected_end_date', '>=', $today)
            ->get();
        foreach ($rentals as $rental) {
            $employees = $rental->rentalItems->flatMap(function ($item) {
                return $item->operators ?? [];
            })->unique('id');
            foreach ($employees as $employee) {
                $this->createTimesheet($employee, $today, $rental->id, null);
            }
        }

        // Projects
        $projects = Project::where('status', 'active')
            ->whereDate('start_date', '<=', $today)
            ->whereDate('end_date', '>=', $today)
            ->get();
        foreach ($projects as $project) {
            $employees = $project->employees ?? [];
            foreach ($employees as $employee) {
                $this->createTimesheet($employee, $today, null, $project->id);
            }
        }

        $this->info('Auto-generation of timesheets completed.');
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
