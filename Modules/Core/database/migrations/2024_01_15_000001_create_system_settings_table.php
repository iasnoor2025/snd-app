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
        Schema::create('system_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique()->index();
            $table->longText('value')->nullable();
            $table->enum('type', ['string', 'integer', 'float', 'boolean', 'array', 'json'])->default('string');
            $table->string('category', 50)->default('general')->index();
            $table->text('description')->nullable();
            $table->boolean('is_public')->default(false)->index();
            $table->boolean('is_encrypted')->default(false);
            $table->json('validation_rules')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Indexes for better performance
            $table->index(['category', 'is_public']);
            $table->index(['type', 'category']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_settings');
    }
};
