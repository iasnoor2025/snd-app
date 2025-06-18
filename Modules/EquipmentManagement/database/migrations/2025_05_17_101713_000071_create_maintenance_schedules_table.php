<?php
namespace Modules\EquipmentManagement\database\migrations;

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
        Schema::create('maintenance_schedules', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->unsignedBigInteger('equipment_id')->onDelete('cascade');
            $table->enum('frequency_type', ['one-time', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'usage-based']);
            $table->integer('frequency_value')->nullable();
            $table->string('frequency_unit')->nullable();
            $table->timestamp('start_date');
            $table->timestamp('end_date')->nullable();
            $table->integer('priority')->default(1);
            $table->boolean('is_active')->default(true);
            $table->unsignedBigInteger('created_by');
            $table->unsignedBigInteger('updated_by')->nullable()->constrained('users');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('maintenance_schedules');
    }
};
