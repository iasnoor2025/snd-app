<?php

namespace Modules\EmployeeManagement\Console\Commands;

use Illuminate\Console\Command;
use Modules\EmployeeManagement\Services\EmployeeAssignmentService;
use Modules\EmployeeManagement\Domain\Models\Employee;

class FixAssignmentStatuses extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'employees:fix-assignment-statuses {employee_id? : The employee ID to fix (optional)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fix assignment statuses for employees';

    /**
     * Execute the console command.
     */
    public function handle(EmployeeAssignmentService $assignmentService)
    {
        $employeeId = $this->argument('employee_id');

        if ($employeeId) {
            // Fix for specific employee
            $employee = Employee::find($employeeId);
            if (!$employee) {
                $this->error("Employee with ID {$employeeId} not found.");
                return 1;
            }

            $this->info("Fixing assignment statuses for employee: {$employee->first_name} {$employee->last_name}");
            $assignmentService->manageAssignmentStatuses($employeeId);
            $this->info("Assignment statuses fixed for employee {$employeeId}");
        } else {
            // Fix for all employees
            $employees = Employee::whereHas('assignments')->get();
            $this->info("Found {$employees->count()} employees with assignments");

            $bar = $this->output->createProgressBar($employees->count());
            $bar->start();

            foreach ($employees as $employee) {
                $assignmentService->manageAssignmentStatuses($employee->id);
                $bar->advance();
            }

            $bar->finish();
            $this->newLine();
            $this->info("Assignment statuses fixed for all employees");
        }

        return 0;
    }
}
