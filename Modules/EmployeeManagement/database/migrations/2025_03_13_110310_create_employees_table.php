<?php
namespace Modules\EmployeeManagement\database\migrations;

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
        // Only update the existing employees table but don't drop it
        if (Schema::hasTable('employees')) {
            // Add new columns to the employees table if they don't exist already
            if (!Schema::hasColumn('employees', 'position_id')) {
                Schema::table('employees', function (Blueprint $table) {
                    $table->foreignId('position_id')->nullable()->after('department_id');
                    $table->string('designation')->nullable()->after('position_id');
                    // Add other new columns as needed
                });
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Do not drop the employees table as it might be used by other migrations
        if (Schema::hasTable('employees') && Schema::hasColumn('employees', 'position_id')) {
            Schema::table('employees', function (Blueprint $table) {
                $table->dropColumn(['position_id', 'designation']);
                // Drop other columns added in up() if needed
            });
        }
    }
};


