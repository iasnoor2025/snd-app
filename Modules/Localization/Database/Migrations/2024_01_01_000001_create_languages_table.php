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
        Schema::create('languages', function (Blueprint $table) {
            $table->id();
            $table->string('code', 10)->unique()->index(); // Language code (e.g., 'en', 'es', 'fr')
            $table->string('name', 100); // English name (e.g., 'English', 'Spanish')
            $table->string('native_name', 100); // Native name (e.g., 'English', 'Español')
            $table->enum('direction', ['ltr', 'rtl'])->default('ltr'); // Text direction
            $table->boolean('enabled')->default(true)->index(); // Is language enabled
            $table->boolean('is_default')->default(false)->index(); // Is default language
            $table->integer('completion_percentage')->default(0); // Translation completion percentage
            $table->string('flag_icon', 50)->nullable(); // Flag icon identifier
            $table->integer('sort_order')->default(0)->index(); // Sort order for display
            $table->json('metadata')->nullable(); // Additional metadata
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['enabled', 'sort_order']);
            $table->index(['is_default', 'enabled']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('languages');
    }
};
