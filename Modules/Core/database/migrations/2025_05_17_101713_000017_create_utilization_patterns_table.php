<?php
namespace Modules\Core\database\migrations;

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
        Schema::create('utilization_patterns', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('equipment_id')->onDelete('cascade');
            $table->string('pattern_type');
            $table->json('pattern_data');
            $table->dateTime('period_start');
            $table->dateTime('period_end');
            $table->decimal('average_utilization', 5, 2);
            $table->decimal('peak_utilization', 5, 2);
            $table->json('hourly_distribution')->nullable();
            $table->json('daily_distribution')->nullable();
            $table->json('monthly_distribution')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('utilization_patterns');
    }
};
