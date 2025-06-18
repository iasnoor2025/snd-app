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
        Schema::create('rental_operator_assignments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('employee_id')->onDelete('cascade');
            $table->unsignedBigInteger('rental_id')->onDelete('cascade');
            $table->unsignedBigInteger('equipment_id')->nullable()->constrained('equipment')->nullOnDelete();
            $table->string('status')->default('active');
            $table->timestamp('assignment_date')->nullable();
            $table->timestamp('end_date')->nullable();
            $table->decimal('daily_rate', 10, 2)->nullable();
            $table->decimal('hourly_rate', 10, 2)->nullable();
            $table->text('notes')->nullable();
            $table->unsignedBigInteger('assigned_by_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rental_operator_assignments');
    }
};
