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
        Schema::table('rental_operator_assignments', function (Blueprint $table) {
            $table->string('status')->default('active')->after('equipment_id');
            $table->text('notes')->nullable()->after('hourly_rate');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rental_operator_assignments', function (Blueprint $table) {
            $table->dropColumn(['status', 'notes']);
        });
    }
};
