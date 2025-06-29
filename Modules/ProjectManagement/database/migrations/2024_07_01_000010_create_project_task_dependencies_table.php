<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('project_task_dependencies', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('task_id');
            $table->unsignedBigInteger('depends_on_task_id');
            $table->timestamps();

            $table->foreign('task_id')->references('id')->on('project_tasks')->onDelete('cascade');
            $table->foreign('depends_on_task_id')->references('id')->on('project_tasks')->onDelete('cascade');
            $table->unique(['task_id', 'depends_on_task_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_task_dependencies');
    }
};
