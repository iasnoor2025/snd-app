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
        Schema::table('timesheets', function (Blueprint $table) {
            // Add assignment_id column for new assignment-based structure
            $table->unsignedBigInteger('assignment_id')->nullable()->after('employee_id')->comment('References employee_assignments table');

            // Add foreign key constraint
            $table->foreign('assignment_id')->references('id')->on('employee_assignments')->onDelete('set null');

            // Add indexes for better performance
            $table->index(['assignment_id', 'date']);

            // Add comments to legacy columns
            $table->unsignedBigInteger('project_id')->nullable()->comment('Legacy - use assignment_id instead')->change();
            $table->unsignedBigInteger('rental_id')->nullable()->comment('Legacy - use assignment_id instead')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('timesheets', function (Blueprint $table) {
            // Drop foreign key and index first
            $table->dropForeign(['assignment_id']);
            $table->dropIndex(['assignment_id', 'date']);

            // Drop the assignment_id column
            $table->dropColumn('assignment_id');

            // Remove comments from legacy columns (restore original state)
            $table->unsignedBigInteger('project_id')->nullable()->change();
            $table->unsignedBigInteger('rental_id')->nullable()->change();
        });
    }
};
