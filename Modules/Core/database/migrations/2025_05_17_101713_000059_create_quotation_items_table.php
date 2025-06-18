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
        Schema::create('quotation_items', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->unsignedBigInteger('employee_id')->nullable()->constrained('employees')->nullOnDelete();
            $table->enum('category', ['operator', 'driver'])->default('operator');
            $table->decimal('hourly_rate', 10, 2)->nullable();
            $table->decimal('daily_rate', 10, 2)->nullable();
            $table->boolean('is_available')->default(true);
            $table->unsignedBigInteger('quotation_id')->cascadeOnDelete();
            $table->unsignedBigInteger('equipment_id')->cascadeOnDelete();
            $table->unsignedBigInteger('operator_id')->nullable()->constrained('operators')->nullOnDelete();
            $table->decimal('rate', 10, 2);
            $table->enum('rate_type', ['hourly', 'daily', 'weekly', 'monthly'])->default('daily');
            $table->integer('quantity')->default(1);
            $table->decimal('discount_percentage', 5, 2)->default(0);
            $table->decimal('total_amount', 10, 2);
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quotation_items');
    }
};
