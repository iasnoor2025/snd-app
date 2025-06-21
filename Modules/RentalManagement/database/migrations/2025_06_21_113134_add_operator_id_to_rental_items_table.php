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
            $table->foreignId('operator_id')->nullable()->after('employee_id')->constrained('employees')->nullOnDelete();
        });

        // Copy data from employee_id to operator_id for existing records
        DB::table('rental_items')
            ->whereNotNull('employee_id')
            ->update(['operator_id' => DB::raw('employee_id')]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rental_items', function (Blueprint $table) {
            $table->dropForeign(['operator_id']);
            $table->dropColumn('operator_id');
        });
    }
};
