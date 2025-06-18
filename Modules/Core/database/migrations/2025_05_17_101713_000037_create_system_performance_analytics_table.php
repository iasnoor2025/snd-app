<?php
namespace Modules\Core\database\migrations;

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
        Schema::create('system_performance_analytics', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('equipment_id');
            $table->date('date');
            $table->integer('total_hours_used');
            $table->integer('rental_count');
            $table->decimal('revenue_generated', 10, 2);
            $table->decimal('maintenance_cost', 10, 2);
            $table->decimal('utilization_rate', 5, 2);
            $table->json('performance_metrics')->nullable();
            $table->unsignedBigInteger('customer_id');
            $table->decimal('total_spent', 10, 2);
            $table->decimal('average_rating', 3, 2);
            $table->integer('feedback_count');
            $table->json('rental_preferences')->nullable();
            $table->json('behavior_metrics')->nullable();
            $table->string('period_type');
            $table->decimal('total_revenue', 10, 2);
            $table->decimal('rental_revenue', 10, 2);
            $table->decimal('maintenance_revenue', 10, 2);
            $table->decimal('other_revenue', 10, 2);
            $table->json('category_breakdown')->nullable();
            $table->json('trend_metrics')->nullable();
            $table->string('item_code');
            $table->integer('stock_level');
            $table->integer('stock_movements');
            $table->decimal('stock_value', 10, 2);
            $table->decimal('turnover_rate', 5, 2);
            $table->json('demand_metrics')->nullable();
            $table->json('forecast_data')->nullable();
            $table->timestamp('timestamp');
            $table->string('metric_name');
            $table->decimal('metric_value', 10, 2);
            $table->string('category');
            $table->json('additional_data')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_performance_analytics');
    }
};
