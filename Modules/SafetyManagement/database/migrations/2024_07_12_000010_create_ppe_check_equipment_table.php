<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('ppe_check_equipment', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ppe_check_id')->constrained('ppe_checks');
            $table->foreignId('equipment_id')->constrained('equipment');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ppe_check_equipment');
    }
};
