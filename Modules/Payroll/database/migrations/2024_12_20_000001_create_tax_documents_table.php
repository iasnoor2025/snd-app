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
        Schema::create('tax_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->integer('tax_year');
            $table->string('document_number')->unique();
            $table->decimal('gross_income', 12, 2)->default(0);
            $table->decimal('tax_withheld', 12, 2)->default(0);
            $table->decimal('net_income', 12, 2)->default(0);
            $table->decimal('effective_tax_rate', 8, 4)->default(0);
            $table->decimal('total_deductions', 12, 2)->default(0);
            $table->decimal('overtime_income', 12, 2)->default(0);
            $table->decimal('bonus_income', 12, 2)->default(0);
            $table->decimal('other_income', 12, 2)->default(0);
            $table->decimal('insurance_deductions', 12, 2)->default(0);
            $table->decimal('advance_deductions', 12, 2)->default(0);
            $table->decimal('other_deductions', 12, 2)->default(0);
            $table->timestamp('generated_at')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('archived_at')->nullable();
            $table->enum('status', ['draft', 'generated', 'sent', 'archived'])->default('draft');
            $table->text('notes')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            // Indexes
            $table->index(['employee_id', 'tax_year']);
            $table->index('tax_year');
            $table->index('status');
            $table->unique(['employee_id', 'tax_year']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tax_documents');
    }
};
