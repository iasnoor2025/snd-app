<?php
namespace Modules\RentalManagement\database\migrations;

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
        // Only add columns to existing table if they don't exist
        if (Schema::hasTable('rentals')) {
            // Add additional columns if they don't already exist
            if (!Schema::hasColumn('rentals', 'equipment_name')) {
                Schema::table('rentals', function (Blueprint $table) {
                    $table->string('equipment_name')->nullable()->after('rental_number');
                    $table->text('description')->nullable()->after('equipment_name');
                    // Add other columns as needed
                });
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Do not drop the rentals table
        if (Schema::hasTable('rentals') && Schema::hasColumn('rentals', 'equipment_name')) {
            Schema::table('rentals', function (Blueprint $table) {
                $table->dropColumn(['equipment_name', 'description']);
                // Drop other added columns as needed
            });
        }
    }
};


