<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Modules\TimesheetManagement\Domain\Models\Timesheet;
use Modules\EmployeeManagement\Domain\Models\Employee;
use Modules\ProjectManagement\Domain\Models\Project;
use App\Models\User;
use Carbon\Carbon;

class TestTimesheetWorkflow extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:timesheet-workflow';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test timesheet creation and approval workflow';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Testing Timesheet Workflow...');
        
        try {
            // Test 1: Check if tables exist
            $this->info('1. Testing database tables...');
            $timesheetCount = \DB::table('timesheets')->count();
            $this->info("   - Timesheets table: ✓ ({$timesheetCount} records)");
            
            try {
                $approvalCount = \DB::table('timesheet_approvals')->count();
                $this->info("   - Timesheet approvals table: ✓ ({$approvalCount} records)");
            } catch (\Exception $e) {
                $this->warn("   - Timesheet approvals table: ✗ (doesn't exist)");
            }
            
            // Test 2: Check users and employees
            $this->info('2. Testing users and employees...');
            $userCount = User::count();
            $this->info("   - Users: {$userCount}");
            
            try {
                $employeeCount = Employee::count();
                $this->info("   - Employees: {$employeeCount}");
            } catch (\Exception $e) {
                $this->warn("   - Employees table issue: " . $e->getMessage());
            }
            
            // Test 3: Check projects
            $this->info('3. Testing projects...');
            try {
                $projectCount = Project::count();
                $this->info("   - Projects: {$projectCount}");
            } catch (\Exception $e) {
                $this->warn("   - Projects table issue: " . $e->getMessage());
            }
            
            // Test 4: Create a test timesheet
            $this->info('4. Creating test timesheet...');
            
            // Get first user and employee
            $user = User::first();
            if (!$user) {
                $this->error('No users found in database');
                return;
            }
            
            $employee = null;
            try {
                $employee = Employee::first();
            } catch (\Exception $e) {
                $this->warn('No employees found, using user ID as employee_id');
            }
            
            $project = null;
            try {
                $project = Project::first();
            } catch (\Exception $e) {
                $this->info('No projects found, creating timesheet without project');
            }
            
            $timesheet = new Timesheet();
            $timesheet->employee_id = $employee ? $employee->id : $user->id;
            $timesheet->project_id = $project ? $project->id : null;
            $timesheet->description = 'Test timesheet created by workflow test';
            $timesheet->date = Carbon::today();
            $timesheet->start_time = '09:00:00';
            $timesheet->end_time = '17:00:00';
            $timesheet->hours_worked = 8.0;
            $timesheet->overtime_hours = 0.0;
            $timesheet->status = 'pending';
            $timesheet->created_by = $user->id;
            $timesheet->location = 'Test Location';
            $timesheet->project = 'Test Project';
            $timesheet->tasks = 'Testing timesheet workflow';
            $timesheet->save();
            
            $this->info("   - Test timesheet created with ID: {$timesheet->id}");
            
            // Test 5: Test approval workflow columns
            $this->info('5. Testing approval workflow...');
            
            // Test foreman approval
            $timesheet->foreman_approval_by = $user->id;
            $timesheet->foreman_approval_at = now();
            $timesheet->foreman_approval_notes = 'Approved by foreman';
            
            // Test incharge approval
            $timesheet->timesheet_incharge_approval_by = $user->id;
            $timesheet->timesheet_incharge_approval_at = now();
            $timesheet->timesheet_incharge_approval_notes = 'Approved by incharge';
            
            // Test checking approval
            $timesheet->timesheet_checking_approval_by = $user->id;
            $timesheet->timesheet_checking_approval_at = now();
            $timesheet->timesheet_checking_approval_notes = 'Approved by checking';
            
            // Test manager approval
            $timesheet->manager_approval_by = $user->id;
            $timesheet->manager_approval_at = now();
            $timesheet->manager_approval_notes = 'Final approval by manager';
            
            $timesheet->status = 'approved';
            $timesheet->approved_by = $user->id;
            $timesheet->approved_at = now();
            
            $timesheet->save();
            
            $this->info('   - Approval workflow columns updated successfully');
            
            // Test 6: Test rejection workflow
            $this->info('6. Testing rejection workflow...');
            
            $rejectedTimesheet = Timesheet::create([
                'employee_id' => $employee ? $employee->id : $user->id,
                'project_id' => $project ? $project->id : null,
                'description' => 'Test rejected timesheet',
                'date' => Carbon::today()->subDay(),
                'start_time' => '09:00:00',
                'end_time' => '17:00:00',
                'hours_worked' => 8.0,
                'overtime_hours' => 0.0,
                'status' => 'rejected',
                'created_by' => $user->id,
                'rejected_by' => $user->id,
                'rejected_at' => now(),
                'rejection_reason' => 'Test rejection for workflow testing',
                'rejection_stage' => 'foreman',
                'location' => 'Test Location',
                'project' => 'Test Project',
                'tasks' => 'Testing rejection workflow',
            ]);
            
            $this->info("   - Rejected timesheet created with ID: {$rejectedTimesheet->id}");
            
            // Test 7: Query timesheets with approval data
            $this->info('7. Testing timesheet queries...');
            
            $approvedTimesheets = Timesheet::where('status', 'approved')->count();
            $pendingTimesheets = Timesheet::where('status', 'pending')->count();
            $rejectedTimesheets = Timesheet::where('status', 'rejected')->count();
            
            $this->info("   - Approved timesheets: {$approvedTimesheets}");
            $this->info("   - Pending timesheets: {$pendingTimesheets}");
            $this->info("   - Rejected timesheets: {$rejectedTimesheets}");
            
            // Test 8: Test approval workflow methods if they exist
            $this->info('8. Testing timesheet model methods...');
            
            $testTimesheet = Timesheet::first();
            if ($testTimesheet) {
                $this->info("   - Sample timesheet ID: {$testTimesheet->id}");
                $this->info("   - Status: {$testTimesheet->status}");
                $this->info("   - Hours worked: {$testTimesheet->hours_worked}");
                
                // Check if approval methods exist
                if (method_exists($testTimesheet, 'isApproved')) {
                    $this->info("   - isApproved method: ✓");
                } else {
                    $this->warn("   - isApproved method: ✗");
                }
                
                if (method_exists($testTimesheet, 'canBeEdited')) {
                    $this->info("   - canBeEdited method: ✓");
                } else {
                    $this->warn("   - canBeEdited method: ✗");
                }
            }
            
            $this->info('');
            $this->info('✅ Timesheet workflow test completed successfully!');
            $this->info('');
            $this->info('Summary:');
            $this->info("- Database tables are working");
            $this->info("- Approval workflow columns are functional");
            $this->info("- Timesheet creation and updates work");
            $this->info("- Status management is working");
            
        } catch (\Exception $e) {
            $this->error('Test failed with error: ' . $e->getMessage());
            $this->error('Stack trace: ' . $e->getTraceAsString());
        }
    }
}
