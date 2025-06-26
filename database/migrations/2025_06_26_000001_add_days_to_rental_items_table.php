<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('rental_items', function (Blueprint $table) {
            $table->integer('days')->default(1)->after('rate_type');
        });

        // Calculate days for existing records based on rental dates
        DB::statement("
            UPDATE rental_items 
            SET days = CASE
                WHEN r.actual_end_date IS NOT NULL 
                    THEN GREATEST(1, CEIL(EXTRACT(EPOCH FROM (r.actual_end_date - r.start_date)) / 86400))
                ELSE GREATEST(1, CEIL(EXTRACT(EPOCH FROM (r.expected_end_date - r.start_date)) / 86400))
            END
            FROM rentals r
            WHERE rental_items.rental_id = r.id
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rental_items', function (Blueprint $table) {
            $table->dropColumn('days');
        });
    }
}; 