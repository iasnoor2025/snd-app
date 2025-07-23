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
        Schema::create('timesheets', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('employee_id')->cascadeOnDelete();

            // New assignment-based structure
            $table->unsignedBigInteger('assignment_id')->nullable()->comment('References employee_assignments table');

            // Legacy columns for backward compatibility
            $table->unsignedBigInteger('project_id')->nullable()->comment('Legacy - use assignment_id instead');
            $table->unsignedBigInteger('rental_id')->nullable()->comment('Legacy - use assignment_id instead');

            $table->text('description')->nullable();
            $table->date('date');
            $table->time('start_time');
            $table->time('end_time')->nullable();
            $table->decimal('hours_worked', 5, 2)->default(0);
            $table->decimal('overtime_hours', 5, 2)->default(0);
            $table->string('status')->default('pending')->comment('pending, approved, rejected');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->text('notes')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->string('location')->nullable();
            $table->string('project')->nullable();
            $table->string('tasks')->nullable();

            // Foreign key constraints
            $table->foreign('assignment_id')->references('id')->on('employee_assignments')->onDelete('set null');
            $table->foreign('project_id')->references('id')->on('projects')->onDelete('set null');
            $table->foreign('rental_id')->references('id')->on('rentals')->onDelete('set null');

            $table->timestamps();
            $table->softDeletes();

            // Indexes for better performance
            $table->index(['employee_id', 'date']);
            $table->index(['assignment_id', 'date']);
            $table->index(['project_id', 'date']);
            $table->index(['rental_id', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('timesheets');
    }
};
