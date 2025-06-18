<?php
namespace Modules\ProjectManagement\database\migrations;

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
        Schema::table('projects', function (Blueprint $table) {
            if (!Schema::hasColumn('projects', 'manpower_cost')) {
                $table->decimal('manpower_cost', 10, 2)->default(0);
            }
            if (!Schema::hasColumn('projects', 'equipment_cost')) {
                $table->decimal('equipment_cost', 10, 2)->default(0);
            }
            if (!Schema::hasColumn('projects', 'material_cost')) {
                $table->decimal('material_cost', 10, 2)->default(0);
            }
            if (!Schema::hasColumn('projects', 'fuel_cost')) {
                $table->decimal('fuel_cost', 10, 2)->default(0);
            }
            if (!Schema::hasColumn('projects', 'expense_cost')) {
                $table->decimal('expense_cost', 10, 2)->default(0);
            }
            if (!Schema::hasColumn('projects', 'total_cost')) {
                $table->decimal('total_cost', 10, 2)->default(0);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn([
                'manpower_cost',
                'equipment_cost',
                'material_cost',
                'fuel_cost',
                'expense_cost',
                'total_cost'
            ]);
        });
    }
};
