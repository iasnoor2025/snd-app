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
        Schema::table('equipment', function (Blueprint $table) {
            // Add new columns only if they don't exist
            if (!Schema::hasColumn('equipment', 'door_number')) {
                $table->string('door_number')->nullable()->unique();
            }
            if (!Schema::hasColumn('equipment', 'current_operating_hours')) {
                $table->decimal('current_operating_hours', 10, 2)->nullable();
            }
            if (!Schema::hasColumn('equipment', 'current_mileage')) {
                $table->decimal('current_mileage', 10, 2)->nullable();
            }
            if (!Schema::hasColumn('equipment', 'current_cycle_count')) {
                $table->integer('current_cycle_count')->nullable();
            }
            if (!Schema::hasColumn('equipment', 'initial_operating_hours')) {
                $table->decimal('initial_operating_hours', 10, 2)->nullable();
            }
            if (!Schema::hasColumn('equipment', 'initial_mileage')) {
                $table->decimal('initial_mileage', 10, 2)->nullable();
            }
            if (!Schema::hasColumn('equipment', 'initial_cycle_count')) {
                $table->integer('initial_cycle_count')->nullable();
            }
            if (!Schema::hasColumn('equipment', 'last_metric_update')) {
                $table->dateTime('last_metric_update')->nullable();
            }
            if (!Schema::hasColumn('equipment', 'avg_daily_usage_hours')) {
                $table->decimal('avg_daily_usage_hours', 10, 2)->nullable();
            }
            if (!Schema::hasColumn('equipment', 'avg_daily_usage_miles')) {
                $table->decimal('avg_daily_usage_miles', 10, 2)->nullable();
            }
            if (!Schema::hasColumn('equipment', 'avg_operating_cost_per_hour')) {
                $table->decimal('avg_operating_cost_per_hour', 10, 2)->nullable();
            }
            if (!Schema::hasColumn('equipment', 'avg_operating_cost_per_mile')) {
                $table->decimal('avg_operating_cost_per_mile', 10, 2)->nullable();
            }
            if (!Schema::hasColumn('equipment', 'lifetime_maintenance_cost')) {
                $table->decimal('lifetime_maintenance_cost', 15, 2)->nullable();
            }
            if (!Schema::hasColumn('equipment', 'efficiency_rating')) {
                $table->decimal('efficiency_rating', 5, 2)->nullable();
            }
            if (!Schema::hasColumn('equipment', 'next_performance_review')) {
                $table->dateTime('next_performance_review')->nullable();
            }
            if (!Schema::hasColumn('equipment', 'current_utilization_rate')) {
                $table->decimal('current_utilization_rate', 5, 2)->nullable();
            }
            if (!Schema::hasColumn('equipment', 'avg_daily_utilization')) {
                $table->decimal('avg_daily_utilization', 5, 2)->nullable();
            }
            if (!Schema::hasColumn('equipment', 'avg_weekly_utilization')) {
                $table->decimal('avg_weekly_utilization', 5, 2)->nullable();
            }
            if (!Schema::hasColumn('equipment', 'avg_monthly_utilization')) {
                $table->decimal('avg_monthly_utilization', 5, 2)->nullable();
            }
            if (!Schema::hasColumn('equipment', 'idle_periods_count')) {
                $table->integer('idle_periods_count')->nullable();
            }
            if (!Schema::hasColumn('equipment', 'total_idle_days')) {
                $table->integer('total_idle_days')->nullable();
            }
            if (!Schema::hasColumn('equipment', 'last_utilization_update')) {
                $table->dateTime('last_utilization_update')->nullable();
            }
            if (!Schema::hasColumn('equipment', 'optimal_utilization_target')) {
                $table->decimal('optimal_utilization_target', 5, 2)->nullable();
            }
            if (!Schema::hasColumn('equipment', 'utilization_cost_impact')) {
                $table->decimal('utilization_cost_impact', 10, 2)->nullable();
            }
            if (!Schema::hasColumn('equipment', 'purchase_cost')) {
                $table->decimal('purchase_cost', 12, 2)->nullable();
            }
            if (!Schema::hasColumn('equipment', 'depreciated_value')) {
                $table->decimal('depreciated_value', 12, 2)->nullable();
            }
            if (!Schema::hasColumn('equipment', 'depreciation_rate')) {
                $table->decimal('depreciation_rate', 8, 4)->nullable();
            }
            if (!Schema::hasColumn('equipment', 'last_depreciation_update')) {
                $table->date('last_depreciation_update')->nullable();
            }
            if (!Schema::hasColumn('equipment', 'expected_replacement_date')) {
                $table->date('expected_replacement_date')->nullable();
            }
            if (!Schema::hasColumn('equipment', 'is_fully_depreciated')) {
                $table->boolean('is_fully_depreciated')->default(false);
            }
            if (!Schema::hasColumn('equipment', 'replacement_cost_estimate')) {
                $table->decimal('replacement_cost_estimate', 12, 2)->nullable();
            }
            if (!Schema::hasColumn('equipment', 'value_appreciation')) {
                $table->decimal('value_appreciation', 12, 2)->nullable();
            }
            if (!Schema::hasColumn('equipment', 'asset_condition')) {
                $table->string('asset_condition')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop added columns
        Schema::table('equipment', function (Blueprint $table) {
            $table->dropColumn([
                'door_number',
                'current_operating_hours',
                'current_mileage',
                'current_cycle_count',
                'initial_operating_hours',
                'initial_mileage',
                'initial_cycle_count',
                'last_metric_update',
                'avg_daily_usage_hours',
                'avg_daily_usage_miles',
                'avg_operating_cost_per_hour',
                'avg_operating_cost_per_mile',
                'lifetime_maintenance_cost',
                'efficiency_rating',
                'next_performance_review',
                'current_utilization_rate',
                'avg_daily_utilization',
                'avg_weekly_utilization',
                'avg_monthly_utilization',
                'idle_periods_count',
                'total_idle_days',
                'last_utilization_update',
                'optimal_utilization_target',
                'utilization_cost_impact',
                'purchase_cost',
                'depreciated_value',
                'depreciation_rate',
                'last_depreciation_update',
                'expected_replacement_date',
                'is_fully_depreciated',
                'replacement_cost_estimate',
                'value_appreciation',
                'asset_condition'
            ]);
        });
    }
};
