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
        Schema::create('equipment_utilization_analytics', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->decimal('total_revenue', 10, 2);
            $table->decimal('rental_revenue', 10, 2);
            $table->decimal('maintenance_revenue', 10, 2);
            $table->decimal('other_revenue', 10, 2);
            $table->integer('total_rentals');
            $table->integer('active_rentals');
            $table->json('category_breakdown')->nullable();
            $table->integer('total_customers');
            $table->integer('new_customers');
            $table->integer('active_customers');
            $table->decimal('average_spend', 10, 2);
            $table->decimal('customer_acquisition_cost', 10, 2)->nullable();
            $table->decimal('customer_lifetime_value', 10, 2)->nullable();
            $table->json('customer_segments')->nullable();
            $table->integer('total_equipment');
            $table->integer('rented_equipment');
            $table->integer('available_equipment');
            $table->integer('under_maintenance_equipment');
            $table->decimal('utilization_rate', 5, 2);
            $table->json('category_utilization')->nullable();
            $table->json('monthly_trend')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('equipment_utilization_analytics');
    }
};
