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
        Schema::create('project_resources', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('project_id');
            $table->string('type');
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('quantity', 10, 2);
            $table->decimal('unit_cost', 10, 2);
            $table->decimal('total_cost', 10, 2);
            $table->date('date');
            $table->string('status');
            $table->unsignedBigInteger('equipment_id')->nullable();
            $table->string('equipment_type')->nullable();
            $table->string('equipment_number')->nullable();
            $table->string('operator_name')->nullable();
            $table->string('operator_id')->nullable();
            $table->unsignedBigInteger('employee_id')->nullable();
            $table->string('worker_name');
            $table->string('position')->nullable();
            $table->decimal('daily_rate', 10, 2);
            $table->integer('days_worked')->nullable();
            $table->unsignedBigInteger('material_id')->nullable();
            $table->string('unit')->nullable();
            $table->decimal('liters', 10, 2);
            $table->decimal('price_per_liter', 10, 2);
            $table->text('notes')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_resources');
    }
};
