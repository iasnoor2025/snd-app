<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('safety_actions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('incident_id')->constrained('incidents');
            $table->foreignId('assigned_to')->constrained('users');
            $table->text('action');
            $table->date('due_date');
            $table->dateTime('completed_at')->nullable();
            $table->enum('status', ['open', 'in_progress', 'completed', 'overdue']);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('safety_actions');
    }
};
