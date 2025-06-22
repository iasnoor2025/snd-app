<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Modules\TimesheetManagement\Domain\Models\Timesheet;
use App\Models\User;

class TestTimesheetApproval extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'timesheet:test-approval {timesheet_id : ID of the timesheet to test}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test the complete timesheet approval workflow';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $timesheetId = $this->argument('timesheet_id');
        
        $timesheet = Timesheet::find($timesheetId);
        if (!$timesheet) {
            $this->error("Timesheet with ID {$timesheetId} not found.");
            return 1;
        }
        
        $adminUser = User::where('email', 'admin@ias.com')->first();
        if (!$adminUser) {
            $this->error('Admin user not found.');
            return 1;
        }
        
        $this->info("🧪 Testing Approval Workflow for Timesheet ID: {$timesheetId}");
        $this->info("Employee: {$timesheet->employee->first_name} {$timesheet->employee->last_name}");
        $this->info("Date: {$timesheet->date}");
        $this->line("==========================================");
        
        // Step 1: Submit timesheet
        if ($timesheet->status === 'draft' && $timesheet->canBeSubmitted()) {
            $this->info("📝 Step 1: Submitting timesheet...");
            $timesheet->submit();
            $this->info("✅ Status: {$timesheet->status}");
            $this->info("Progress: {$timesheet->getApprovalProgressPercentage()}%");
        } else {
            $this->warn("⚠️  Timesheet cannot be submitted (Status: {$timesheet->status})");
        }
        
        // Step 2: Foreman Approval
        if ($timesheet->canBeApprovedByForeman()) {
            $this->info("\n👷 Step 2: Foreman Approval...");
            $result = $timesheet->approveByForeman($adminUser->id, 'Approved by foreman - work completed satisfactorily');
            if ($result) {
                $this->info("✅ Status: {$timesheet->status}");
                $this->info("Progress: {$timesheet->getApprovalProgressPercentage()}%");
            } else {
                $this->error("❌ Foreman approval failed");
            }
        } else {
            $this->warn("⚠️  Timesheet cannot be approved by foreman");
        }
        
        // Step 3: Incharge Approval
        if ($timesheet->canBeApprovedByIncharge()) {
            $this->info("\n👨‍💼 Step 3: Incharge Approval...");
            $result = $timesheet->approveByIncharge($adminUser->id, 'Approved by incharge - hours verified');
            if ($result) {
                $this->info("✅ Status: {$timesheet->status}");
                $this->info("Progress: {$timesheet->getApprovalProgressPercentage()}%");
            } else {
                $this->error("❌ Incharge approval failed");
            }
        } else {
            $this->warn("⚠️  Timesheet cannot be approved by incharge");
        }
        
        // Step 4: Checking Approval
        if ($timesheet->canBeApprovedByChecking()) {
            $this->info("\n🔍 Step 4: Checking Approval...");
            $result = $timesheet->approveByChecking($adminUser->id, 'Approved by checking - documentation verified');
            if ($result) {
                $this->info("✅ Status: {$timesheet->status}");
                $this->info("Progress: {$timesheet->getApprovalProgressPercentage()}%");
            } else {
                $this->error("❌ Checking approval failed");
            }
        } else {
            $this->warn("⚠️  Timesheet cannot be approved by checking");
        }
        
        // Step 5: Manager Approval (Final)
        if ($timesheet->canBeApprovedByManager()) {
            $this->info("\n👔 Step 5: Manager Approval (Final)...");
            $result = $timesheet->approveByManager($adminUser->id, 'Final approval by manager - timesheet completed');
            if ($result) {
                $this->info("✅ Status: {$timesheet->status}");
                $this->info("Progress: {$timesheet->getApprovalProgressPercentage()}%");
                $this->info("🎉 APPROVAL WORKFLOW COMPLETED!");
            } else {
                $this->error("❌ Manager approval failed");
            }
        } else {
            $this->warn("⚠️  Timesheet cannot be approved by manager");
        }
        
        $this->line("\n📊 Final Status Summary:");
        $this->line("Status: {$timesheet->status}");
        $this->line("Current Step: " . $timesheet->getCurrentApprovalStep());
        $this->line("Can be edited: " . ($timesheet->canBeEdited() ? 'Yes' : 'No'));
        $this->line("Stage: " . $timesheet->getApprovalStageDescription());
        
        // Test rejection (create another timesheet for this)
        if ($this->confirm('Would you like to test the rejection workflow with a new timesheet?')) {
            $this->call('timesheet:create-test', ['--status' => 'submitted']);
            $newTimesheet = Timesheet::latest()->first();
            
            $this->info("\n🚫 Testing Rejection Workflow...");
            $this->info("Rejecting timesheet ID: {$newTimesheet->id}");
            
            $result = $newTimesheet->reject(
                $adminUser->id,
                'Hours not properly documented',
                Timesheet::REJECTION_STAGE_FOREMAN
            );
            
            if ($result) {
                $this->info("✅ Timesheet rejected successfully");
                $this->info("Status: {$newTimesheet->status}");
                $this->info("Rejection reason: {$newTimesheet->rejection_reason}");
                $this->info("Rejection stage: {$newTimesheet->rejection_stage}");
            } else {
                $this->error("❌ Rejection failed");
            }
        }
        
        return 0;
    }
} 