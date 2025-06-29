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
        if (DB::connection()->getDriverName() === 'sqlite') {
            // SQLite does not support UPDATE ... FROM, so use PHP
            $rentalItems = DB::table('rental_items')->get();
            foreach ($rentalItems as $item) {
                $rental = DB::table('rentals')->where('id', $item->rental_id)->first();
                if ($rental) {
                    $start = strtotime($rental->start_date);
                    $end = $rental->actual_end_date ? strtotime($rental->actual_end_date) : strtotime($rental->expected_end_date);
                    $days = max(1, ceil(($end - $start) / 86400));
                    DB::table('rental_items')->where('id', $item->id)->update(['days' => $days]);
                }
            }
        } else {
            // PostgreSQL or others
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
