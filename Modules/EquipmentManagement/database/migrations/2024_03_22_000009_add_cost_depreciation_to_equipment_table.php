<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('equipment', function (Blueprint $table) {
            $table->decimal('purchase_cost', 15, 2)->nullable();
            $table->integer('depreciation_years')->nullable();
            $table->decimal('current_value', 15, 2)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('equipment', function (Blueprint $table) {
            $table->dropColumn(['purchase_cost', 'depreciation_years', 'current_value']);
        });
    }
};
