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
        Schema::create('equipment_resources', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('project_id')->onDelete('cascade');
            $table->unsignedBigInteger('equipment_id')->onDelete('cascade');
            $table->decimal('daily_rate', 10, 2);
            $table->decimal('total_days', 10, 2);
            $table->decimal('maintenance_cost', 10, 2)->default(0);
            $table->decimal('total_cost', 10, 2);
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('equipment_resources');
    }
};
