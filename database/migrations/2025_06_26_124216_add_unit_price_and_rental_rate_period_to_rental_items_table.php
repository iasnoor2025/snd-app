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
            $table->decimal('unit_price', 10, 2)->after('rate')->default(0);
            $table->string('rental_rate_period')->after('unit_price')->default('daily');
            $table->integer('quantity')->after('rental_rate_period')->default(1);
        });

        // Update existing records
        DB::statement('UPDATE rental_items SET unit_price = rate, rental_rate_period = rate_type, quantity = 1');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rental_items', function (Blueprint $table) {
            $table->dropColumn(['unit_price', 'rental_rate_period', 'quantity']);
        });
    }
};
