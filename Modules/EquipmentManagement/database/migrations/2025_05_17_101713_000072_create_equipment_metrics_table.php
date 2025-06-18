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
        Schema::create('equipment_metrics', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('equipment_id')->onDelete('cascade');
            $table->dateTime('recorded_at');
            $table->decimal('operating_hours', 10, 2)->nullable();
            $table->decimal('mileage', 10, 2)->nullable();
            $table->integer('cycle_count')->nullable();
            $table->decimal('fuel_consumption', 10, 2)->nullable();
            $table->decimal('power_output', 10, 2)->nullable();
            $table->decimal('temperature', 8, 2)->nullable();
            $table->decimal('pressure', 8, 2)->nullable();
            $table->decimal('efficiency_rating', 5, 2)->nullable();
            $table->decimal('utilization_rate', 5, 2)->nullable();
            $table->decimal('downtime_hours', 10, 2)->nullable();
            $table->text('notes')->nullable();
            $table->unsignedBigInteger('recorded_by')->nullable()->constrained('users');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('equipment_metrics');
    }
};
