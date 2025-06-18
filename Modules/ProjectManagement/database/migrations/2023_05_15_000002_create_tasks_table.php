<?php
namespace Modules\ProjectManagement\database\migrations;

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
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('project_id')->onDelete('cascade');
            $table->string('name');
            $table->text('description');
            $table->dateTime('start_date');
            $table->dateTime('due_date')->nullable();
            $table->string('status')->default('pending'); // pending, in-progress, completed, cancelled
            $table->string('priority')->default('medium'); // low, medium, high
            $table->unsignedBigInteger('assigned_to')->nullable()->constrained('users')->onDelete('set null');
            $table->decimal('estimated_hours', 8, 2)->default(0);
            $table->decimal('actual_hours', 8, 2)->default(0);
            $table->decimal('progress', 5, 2)->default(0);
            $table->unsignedBigInteger('parent_task_id')->nullable()->references('id')->on('tasks')->onDelete('cascade');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};


