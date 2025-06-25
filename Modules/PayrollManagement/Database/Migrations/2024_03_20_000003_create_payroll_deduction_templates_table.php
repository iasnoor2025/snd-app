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
        Schema::create('payroll_deduction_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->json('rules');
            $table->json('metadata')->nullable();
            $table->string('status')->default('draft');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
            
            $table->foreign('created_by')
                ->references('id')
                ->on('users')
                ->onDelete('set null');
                
            $table->foreign('updated_by')
                ->references('id')
                ->on('users')
                ->onDelete('set null');
        });

        Schema::create('payroll_template_rules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('deduction_template_id')
                ->constrained('payroll_deduction_templates')
                ->onDelete('cascade');
            $table->foreignId('deduction_rule_id')
                ->constrained('payroll_deduction_rules')
                ->onDelete('cascade');
            $table->integer('order')->default(0);
            $table->timestamps();

            $table->unique(['deduction_template_id', 'deduction_rule_id']);
            $table->index(['deduction_template_id', 'order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payroll_template_rules');
        Schema::dropIfExists('payroll_deduction_templates');
    }
}; 