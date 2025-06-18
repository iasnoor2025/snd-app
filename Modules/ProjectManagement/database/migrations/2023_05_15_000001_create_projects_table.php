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
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description');
            $table->dateTime('start_date');
            $table->dateTime('end_date')->nullable();
            $table->string('status')->default('pending'); // pending, active, completed, cancelled
            $table->decimal('budget', 10, 2);
            $table->unsignedBigInteger('manager_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('client_name');
            $table->string('client_contact');
            $table->string('priority')->default('medium'); // low, medium, high
            $table->decimal('progress', 5, 2)->default(0);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};


