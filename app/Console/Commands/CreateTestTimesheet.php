<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Modules\TimesheetManagement\Domain\Models\Timesheet;
use Modules\EmployeeManagement\Domain\Models\Employee;
use Modules\ProjectManagement\Domain\Models\Project;
use Carbon\Carbon;

class CreateTestTimesheet extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'timesheet:create-test {--status=draft : Status of the timesheet}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a test timesheet for testing the approval workflow';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $status = $this->option('status');
        
        // Get first employee
        $employee = Employee::first();
        if (!$employee) {
            $this->error('No employees found. Please create an employee first.');
            return;
        }
        
        // Get first project (optional)
        $project = Project::first();
        
        // Create timesheet
        $timesheet = Timesheet::create([
            'employee_id' => $employee->id,
            'date' => Carbon::today(),
            'start_time' => Carbon::today()->setTime(9, 0), // 9:00 AM
            'end_time' => Carbon::today()->setTime(17, 0), // 5:00 PM
            'hours_worked' => 8.0,
            'overtime_hours' => 0.0,
            'project_id' => $project?->id,
            'description' => 'Test timesheet entry for approval workflow testing',
            'tasks' => json_encode(['Task 1: Development work', 'Task 2: Code review']),
            'status' => $status,
            'created_by' => 1, // Admin user
        ]);
        
        $this->info("✅ Test timesheet created successfully!");
        $this->info("ID: {$timesheet->id}");
        $this->info("Employee: {$employee->first_name} {$employee->last_name}");
        $this->info("Date: {$timesheet->date}");
        $this->info("Status: {$timesheet->status}");
        $this->info("Hours: {$timesheet->hours_worked}");
        
        $this->line("\n🔗 Test URLs:");
        $this->line("Show: " . url("/hr/timesheets/{$timesheet->id}"));
        $this->line("Edit: " . url("/hr/timesheets/{$timesheet->id}/edit"));
        
        $this->line("\n🔄 Approval Workflow Status:");
        $this->line("Current Step: " . $timesheet->getCurrentApprovalStep());
        $this->line("Can be edited: " . ($timesheet->canBeEdited() ? 'Yes' : 'No'));
        $this->line("Can be submitted: " . ($timesheet->canBeSubmitted() ? 'Yes' : 'No'));
        $this->line("Progress: " . $timesheet->getApprovalProgressPercentage() . '%');
        
        return 0;
    }
} 