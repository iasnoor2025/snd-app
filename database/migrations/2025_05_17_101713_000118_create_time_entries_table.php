<?php

namespace Modules\TimesheetManagement\Database\Migrations;

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void;
     */
    public function up()
    {
        Schema::create('time_entries', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('weekly_timesheet_id');
            $table->unsignedBigInteger('employee_id');
            $table->unsignedBigInteger('project_id')->nullable();
            $table->unsignedBigInteger('task_id')->nullable();
            $table->date('date');
            $table->decimal('hours', 5, 2)->default(0);
            $table->text('description')->nullable();
            $table->boolean('is_overtime')->default(false);
            $table->boolean('is_billable')->default(true);
            $table->timestamp('start_time')->nullable();
            $table->timestamp('end_time')->nullable();
            $table->integer('break_duration')->default(0); // in minutes
            $table->string('status')->default('active');
            $table->timestamps();
            $table->softDeletes();

            // Add index for common query patterns
            $table->index(['employee_id', 'date']);
            $table->index(['project_id', 'date']);
            $table->index(['is_overtime', 'date']);
            $table->index(['is_billable', 'date']);
        });

        // Add foreign keys if the referenced tables exist
        if (Schema::hasTable('weekly_timesheets')) {
            Schema::table('time_entries', function (Blueprint $table) {
                $table->foreign('weekly_timesheet_id')->references('id')->on('weekly_timesheets')->onDelete('cascade');
            });
        }

        if (Schema::hasTable('employees')) {
            Schema::table('time_entries', function (Blueprint $table) {
                $table->foreign('employee_id')->references('id')->on('employees')->onDelete('cascade');
            });
        }

        if (Schema::hasTable('projects')) {
            Schema::table('time_entries', function (Blueprint $table) {
                $table->foreign('project_id')->references('id')->on('projects')->onDelete('set null');
            });
        }

        if (Schema::hasTable('tasks')) {
            Schema::table('time_entries', function (Blueprint $table) {
                $table->foreign('task_id')->references('id')->on('tasks')->onDelete('set null');
            });
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void;
     */
    public function down()
    {
        Schema::dropIfExists('time_entries');
    }
};


