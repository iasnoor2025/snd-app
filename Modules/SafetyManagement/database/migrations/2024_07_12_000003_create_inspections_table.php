<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('inspections', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('module_id')->nullable();
            $table->date('scheduled_date');
            $table->date('completed_date')->nullable();
            $table->text('findings')->nullable();
            $table->enum('status', ['scheduled', 'in_progress', 'completed', 'overdue']);
            $table->timestamps();
            $table->softDeletes();
            // $table->foreign('module_id')->references('id')->on('modules'); // Uncomment if modules table exists
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inspections');
    }
};
