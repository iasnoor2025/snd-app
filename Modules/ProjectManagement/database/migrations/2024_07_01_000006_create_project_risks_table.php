<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('project_risks', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('project_id');
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('probability', ['low', 'medium', 'high'])->default('medium');
            $table->enum('impact', ['low', 'medium', 'high'])->default('medium');
            $table->enum('status', ['open', 'mitigated', 'closed'])->default('open');
            $table->text('mitigation_plan')->nullable();
            $table->timestamps();

            $table->foreign('project_id')->references('id')->on('projects')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_risks');
    }
};
