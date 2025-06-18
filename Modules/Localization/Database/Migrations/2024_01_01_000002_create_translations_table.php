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
        Schema::create('translations', function (Blueprint $table) {
            $table->id();
            $table->string('language_code', 10)->index(); // Reference to languages.code
            $table->string('group', 100)->index(); // Translation group/namespace (e.g., 'auth', 'validation')
            $table->string('key', 255)->index(); // Translation key
            $table->text('value')->nullable(); // Translation value
            $table->boolean('is_dirty')->default(false)->index(); // Needs sync to file
            $table->unsignedBigInteger('created_by')->nullable(); // User who created
            $table->unsignedBigInteger('updated_by')->nullable(); // User who last updated
            $table->timestamps();
            $table->softDeletes();

            // Unique constraint
            $table->unique(['language_code', 'group', 'key'], 'translations_unique');

            // Indexes
            $table->index(['language_code', 'group']);
            $table->index(['language_code', 'is_dirty']);
            $table->index(['group', 'key']);
            $table->index('created_by');
            $table->index('updated_by');

            // Foreign key constraints
            $table->foreign('language_code')
                  ->references('code')
                  ->on('languages')
                  ->onUpdate('cascade')
                  ->onDelete('cascade');

            $table->foreign('created_by')
                  ->references('id')
                  ->on('users')
                  ->onUpdate('cascade')
                  ->onDelete('set null');

            $table->foreign('updated_by')
                  ->references('id')
                  ->on('users')
                  ->onUpdate('cascade')
                  ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('translations');
    }
};
