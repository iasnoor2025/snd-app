<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('salary_increments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();

            // Current salary details
            $table->decimal('current_base_salary', 10, 2);
            $table->decimal('current_food_allowance', 10, 2)->default(0);
            $table->decimal('current_housing_allowance', 10, 2)->default(0);
            $table->decimal('current_transport_allowance', 10, 2)->default(0);

            // New salary details
            $table->decimal('new_base_salary', 10, 2);
            $table->decimal('new_food_allowance', 10, 2)->default(0);
            $table->decimal('new_housing_allowance', 10, 2)->default(0);
            $table->decimal('new_transport_allowance', 10, 2)->default(0);

            // Increment details
            $table->enum('increment_type', ['percentage', 'amount', 'promotion', 'annual_review', 'performance', 'market_adjustment']);
            $table->decimal('increment_percentage', 5, 2)->nullable();
            $table->decimal('increment_amount', 10, 2)->nullable();
            $table->string('reason');
            $table->date('effective_date');

            // Request tracking
            $table->foreignId('requested_by')->constrained('users')->cascadeOnDelete();
            $table->timestamp('requested_at');

            // Approval tracking
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();

            // Rejection tracking
            $table->foreignId('rejected_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('rejected_at')->nullable();
            $table->text('rejection_reason')->nullable();

            // Status and notes
            $table->enum('status', ['pending', 'approved', 'rejected', 'applied'])->default('pending');
            $table->text('notes')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['employee_id', 'status']);
            $table->index(['effective_date', 'status']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('salary_increments');
    }
};
