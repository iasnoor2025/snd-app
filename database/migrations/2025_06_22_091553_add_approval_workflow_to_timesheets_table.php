<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('timesheets', function (Blueprint $table) {
            // Approval workflow fields
            $table->unsignedBigInteger('foreman_approval_by')->nullable()->after('created_by');
            $table->timestamp('foreman_approval_at')->nullable()->after('foreman_approval_by');
            $table->text('foreman_approval_notes')->nullable()->after('foreman_approval_at');
            
            $table->unsignedBigInteger('timesheet_incharge_approval_by')->nullable()->after('foreman_approval_notes');
            $table->timestamp('timesheet_incharge_approval_at')->nullable()->after('timesheet_incharge_approval_by');
            $table->text('timesheet_incharge_approval_notes')->nullable()->after('timesheet_incharge_approval_at');
            
            $table->unsignedBigInteger('timesheet_checking_approval_by')->nullable()->after('timesheet_incharge_approval_notes');
            $table->timestamp('timesheet_checking_approval_at')->nullable()->after('timesheet_checking_approval_by');
            $table->text('timesheet_checking_approval_notes')->nullable()->after('timesheet_checking_approval_at');
            
            $table->unsignedBigInteger('manager_approval_by')->nullable()->after('timesheet_checking_approval_notes');
            $table->timestamp('manager_approval_at')->nullable()->after('manager_approval_by');
            $table->text('manager_approval_notes')->nullable()->after('manager_approval_at');
            
            $table->unsignedBigInteger('rejected_by')->nullable()->after('manager_approval_notes');
            $table->timestamp('rejected_at')->nullable()->after('rejected_by');
            // rejection_reason already exists in the table
            $table->string('rejection_stage')->nullable()->after('rejected_by');
            
            // Add foreign key constraints
            $table->foreign('foreman_approval_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('timesheet_incharge_approval_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('timesheet_checking_approval_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('manager_approval_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('rejected_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('timesheets', function (Blueprint $table) {
            // Drop foreign key constraints first
            $table->dropForeign(['foreman_approval_by']);
            $table->dropForeign(['timesheet_incharge_approval_by']);
            $table->dropForeign(['timesheet_checking_approval_by']);
            $table->dropForeign(['manager_approval_by']);
            $table->dropForeign(['rejected_by']);
            
            // Drop columns
            $table->dropColumn([
                'foreman_approval_by',
                'foreman_approval_at',
                'foreman_approval_notes',
                'timesheet_incharge_approval_by',
                'timesheet_incharge_approval_at',
                'timesheet_incharge_approval_notes',
                'timesheet_checking_approval_by',
                'timesheet_checking_approval_at',
                'timesheet_checking_approval_notes',
                'manager_approval_by',
                'manager_approval_at',
                'manager_approval_notes',
                'rejected_by',
                'rejected_at',
                // rejection_reason already existed, don't drop it
                'rejection_stage',
            ]);
        });
    }
};
