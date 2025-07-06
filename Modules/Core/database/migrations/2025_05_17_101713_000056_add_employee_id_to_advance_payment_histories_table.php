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
        Schema::table('advance_payment_histories', function (Blueprint $table) {
            $table->unsignedBigInteger('employee_id')->nullable()->after('advance_payment_id');
        });

        // Backfill employee_id from advance_payments
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('
                UPDATE advance_payment_histories h
                SET employee_id = a.employee_id
                FROM advance_payments a
                WHERE h.advance_payment_id = a.id
            ');
        } else {
            DB::statement('
                UPDATE advance_payment_histories h
                JOIN advance_payments a ON h.advance_payment_id = a.id
                SET h.employee_id = a.employee_id
            ');
        }

        // Make employee_id not nullable
        Schema::table('advance_payment_histories', function (Blueprint $table) {
            $table->unsignedBigInteger('employee_id')->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('advance_payment_histories', function (Blueprint $table) {
            $table->dropColumn('employee_id');
        });
    }
};
