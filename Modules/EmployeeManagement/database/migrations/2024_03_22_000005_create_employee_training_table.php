<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('employee_training', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->onDelete('cascade');
            $table->foreignId('training_id')->constrained()->onDelete('cascade');
            $table->enum('status', ['assigned', 'in_progress', 'completed'])->default('assigned');
            $table->timestamp('completed_at')->nullable();
            $table->string('certificate_url')->nullable();
            $table->timestamps();
            $table->unique(['employee_id', 'training_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_training');
    }
};
