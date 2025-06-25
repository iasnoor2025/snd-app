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
        Schema::create('tax_rules', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('calculation_method', ['flat_rate', 'progressive', 'threshold_based']);
            $table->decimal('rate', 8, 2)->nullable();
            $table->string('employee_category');
            $table->timestamp('effective_from');
            $table->timestamp('effective_until')->nullable();
            $table->enum('status', ['active', 'inactive', 'draft'])->default('draft');
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('employee_category');
            $table->index('status');
            $table->index(['effective_from', 'effective_until']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tax_rules');
    }
}; 