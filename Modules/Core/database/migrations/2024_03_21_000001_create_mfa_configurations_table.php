<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mfa_configurations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('secret_key')->nullable();
            $table->boolean('is_enabled')->default(false);
            $table->json('backup_codes')->nullable();
            $table->timestamp('last_verified_at')->nullable();
            $table->json('recovery_email')->nullable();
            $table->timestamps();

            $table->unique(['user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mfa_configurations');
    }
}; 