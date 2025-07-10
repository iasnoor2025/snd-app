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
        Schema::create('project_equipment', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('project_id')->onDelete('cascade');
            $table->unsignedBigInteger('equipment_id')->onDelete('cascade');
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->decimal('usage_hours', 8, 2);
            $table->decimal('hourly_rate', 10, 2);
            $table->decimal('maintenance_cost', 10, 2)->default(0);
            $table->decimal('total_cost', 10, 2);
            $table->text('notes')->nullable();
            $table->date('date_used');
            $table->string('name');
            $table->string('unit')->nullable();
            $table->decimal('quantity', 10, 2);
            $table->decimal('unit_price', 10, 2);
            $table->string('type');
            $table->string('category');
            $table->decimal('amount', 10, 2);
            $table->text('description')->nullable();
            $table->decimal('equipment_cost', 10, 2)->default(0);
            $table->decimal('unit_cost', 10, 2);
            $table->string('status');
            $table->string('worker_name');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_equipment');
    }
};
