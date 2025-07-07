<?php
namespace Modules\RentalManagement\database\migrations;

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
        Schema::create('rental_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rental_id')->constrained('rentals')->onDelete('cascade');
            $table->foreignId('equipment_id')->constrained('equipment')->onDelete('cascade');
            $table->foreignId('employee_id')->nullable()->constrained('employees')->nullOnDelete();
            $table->decimal('rate', 10, 2);
            $table->enum('rate_type', ['daily', 'weekly', 'monthly'])->default('daily');
            $table->decimal('discount_percentage', 5, 2)->default(0);
            $table->decimal('total_amount', 10, 2);
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rental_items');
    }
};
