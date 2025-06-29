<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('equipment_codes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_id')->constrained()->onDelete('cascade');
            $table->string('code_type'); // 'qr' or 'barcode'
            $table->string('code_value')->unique();
            $table->boolean('is_primary')->default(false);
            $table->timestamp('last_scanned_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            // Ensure only one primary code per equipment
            $table->unique(['equipment_id', 'is_primary'], 'unique_primary_code');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('equipment_codes');
    }
}; 