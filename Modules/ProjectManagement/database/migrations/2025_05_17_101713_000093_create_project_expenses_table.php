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
        Schema::create('project_expenses', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('project_id')->onDelete('cascade');
            $table->unsignedBigInteger('employee_id')->nullable()->constrained()->onDelete('set null');
            $table->string('job_title');
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->decimal('daily_rate', 10, 2);
            $table->decimal('total_days', 5, 2);
            $table->decimal('total_cost', 10, 2);
            $table->text('notes')->nullable();
            $table->unsignedBigInteger('equipment_id')->nullable()->constrained()->onDelete('set null');
            $table->decimal('usage_hours', 8, 2);
            $table->decimal('hourly_rate', 10, 2);
            $table->decimal('maintenance_cost', 10, 2)->default(0);
            $table->string('name');
            $table->string('unit')->nullable();
            $table->decimal('quantity', 10, 2);
            $table->decimal('unit_price', 10, 2);
            $table->date('date_used');
            $table->string('type');
            $table->date('date');
            $table->string('category');
            $table->decimal('amount', 10, 2);
            $table->text('description');
            $table->decimal('manpower_cost', 10, 2)->default(0);
            $table->decimal('equipment_cost', 10, 2)->default(0);
            $table->decimal('material_cost', 10, 2)->default(0);
            $table->decimal('fuel_cost', 10, 2)->default(0);
            $table->decimal('expense_cost', 10, 2)->default(0);
            $table->decimal('unit_cost', 10, 2);
            $table->string('status')->default('pending');
            $table->string('equipment_type')->nullable();
            $table->string('equipment_number')->nullable();
            $table->string('operator_name')->nullable();
            $table->string('operator_id')->nullable();
            $table->string('worker_name');
            $table->string('position')->nullable();
            $table->integer('days_worked')->nullable();
            $table->unsignedBigInteger('material_id')->nullable()->constrained()->onDelete('set null');
            $table->decimal('liters', 10, 2);
            $table->decimal('price_per_liter', 10, 2);
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
        Schema::dropIfExists('project_expenses');
    }
};
