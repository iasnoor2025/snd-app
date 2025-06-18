<?php

namespace Modules\TimesheetManagement\Database\Migrations;

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
        Schema::create('timesheet_approvals', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('employee_id');
            $table->date('date');
            $table->decimal('hours_worked', 5, 2);
            $table->decimal('overtime_hours', 5, 2)->default(0);
            $table->string('status')->default('pending');
            $table->string('project')->nullable();
            $table->text('tasks')->nullable();
            $table->text('notes')->nullable();
            $table->unsignedBigInteger('submitted_by')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->unsignedBigInteger('rejected_by')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->unsignedBigInteger('foreman_approval_by')->nullable();
            $table->timestamp('foreman_approval_at')->nullable();
            $table->text('foreman_approval_notes')->nullable();
            $table->unsignedBigInteger('timesheet_incharge_approval_by')->nullable();
            $table->timestamp('timesheet_incharge_approval_at')->nullable();
            $table->text('timesheet_incharge_approval_notes')->nullable();
            $table->unsignedBigInteger('timesheet_checking_approval_by')->nullable();
            $table->timestamp('timesheet_checking_approval_at')->nullable();
            $table->text('timesheet_checking_approval_notes')->nullable();
            $table->unsignedBigInteger('manager_approval_by')->nullable();
            $table->timestamp('manager_approval_at')->nullable();
            $table->text('manager_approval_notes')->nullable();
            $table->string('rejection_stage')->nullable();
            $table->json('gps_logs')->nullable();
            $table->unsignedBigInteger('timesheet_id');
            $table->unsignedBigInteger('approver_id');
            $table->integer('approval_level');
            $table->timestamp('action_at')->nullable();
            $table->string('name');
            $table->string('entity_type');
            $table->boolean('is_active')->default(true);
            $table->json('workflow_definition');
            $table->text('description')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('timesheet_approvals');
    }
};
