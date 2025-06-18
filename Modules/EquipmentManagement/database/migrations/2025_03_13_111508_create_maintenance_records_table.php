<?php
namespace Modules\EquipmentManagement\database\migrations;

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
        // Only modify existing table if needed
        if (Schema::hasTable('maintenance_records')) {
            // Add additional columns if they don't exist
            if (!Schema::hasColumn('maintenance_records', 'some_new_column')) {
                Schema::table('maintenance_records', function (Blueprint $table) {
                    // Add new columns as needed
                    // $table->string('some_new_column')->nullable();
                });
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Do not drop the table
        if (Schema::hasTable('maintenance_records') && Schema::hasColumn('maintenance_records', 'some_new_column')) {
            Schema::table('maintenance_records', function (Blueprint $table) {
                // Drop columns added in up() if needed
                // $table->dropColumn('some_new_column');
            });
        }
    }
};


