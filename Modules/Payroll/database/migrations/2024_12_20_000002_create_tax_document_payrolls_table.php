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
        Schema::create('tax_document_payrolls', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tax_document_id')->constrained('tax_documents')->onDelete('cascade');
            $table->foreignId('payroll_id')->constrained('payrolls')->onDelete('cascade');
            $table->timestamps();

            // Indexes
            $table->unique(['tax_document_id', 'payroll_id']);
            $table->index('tax_document_id');
            $table->index('payroll_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tax_document_payrolls');
    }
};
