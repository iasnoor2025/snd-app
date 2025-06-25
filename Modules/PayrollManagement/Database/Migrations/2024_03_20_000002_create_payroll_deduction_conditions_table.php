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
        Schema::create('payroll_deduction_conditions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('deduction_rule_id')
                ->constrained('payroll_deduction_rules')
                ->onDelete('cascade');
            $table->string('field');
            $table->string('operator');
            $table->json('value');
            $table->decimal('amount', 15, 2)->nullable();
            $table->decimal('percentage', 8, 2)->nullable();
            $table->json('metadata')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('field');
            $table->index('operator');
            
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
        Schema::dropIfExists('payroll_deduction_conditions');
    }
}; 