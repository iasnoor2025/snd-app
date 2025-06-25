<?php

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
        Schema::create('payroll_deduction_rules', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('type');
            $table->string('calculation_method');
            $table->decimal('amount', 15, 2)->nullable();
            $table->decimal('percentage', 8, 2)->nullable();
            $table->string('frequency');
            $table->timestamp('effective_from');
            $table->timestamp('effective_until')->nullable();
            $table->boolean('requires_approval')->default(false);
            $table->boolean('auto_apply')->default(false);
            $table->string('employee_category');
            $table->string('status')->default('draft');
            $table->string('base_amount_type')->default('gross');
            $table->json('metadata')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('type');
            $table->index('status');
            $table->index('employee_category');
            $table->index(['effective_from', 'effective_until']);
            
            $table->foreign('created_by')
                ->references('id')
                ->on('users')
                ->onDelete('set null');
                
            $table->foreign('updated_by')
                ->references('id')
                ->on('users')
                ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payroll_deduction_rules');
    }
}; 