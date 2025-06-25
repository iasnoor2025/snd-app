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
        Schema::create('tax_brackets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tax_rule_id')->constrained()->onDelete('cascade');
            $table->decimal('income_from', 12, 2);
            $table->decimal('income_to', 12, 2)->nullable();
            $table->decimal('rate', 8, 2);
            $table->string('description')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('tax_rule_id');
            $table->index('status');
            $table->index(['income_from', 'income_to']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tax_brackets');
    }
}; 