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
        Schema::table('media', function (Blueprint $table) {
            // Add updated_at column if it doesn't exist
            if (!Schema::hasColumn('media', 'updated_at')) {
                $table->timestamp('updated_at')->nullable();
            }

            // Add created_at column if it doesn't exist
            if (!Schema::hasColumn('media', 'created_at')) {
                $table->timestamp('created_at')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('media', function (Blueprint $table) {
            if (Schema::hasColumn('media', 'updated_at')) {
                $table->dropColumn('updated_at');
            }

            if (Schema::hasColumn('media', 'created_at')) {
                $table->dropColumn('created_at');
            }
        });
    }
};
