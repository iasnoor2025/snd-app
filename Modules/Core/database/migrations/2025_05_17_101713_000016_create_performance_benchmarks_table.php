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
        Schema::create('performance_benchmarks', function (Blueprint $table) {
            $table->id();
            $table->string('equipment_type');
            $table->string('model')->nullable();
            $table->string('manufacturer')->nullable();
            $table->string('metric_name');
            $table->decimal('expected_min_value', 15, 4)->nullable();
            $table->decimal('expected_max_value', 15, 4)->nullable();
            $table->decimal('optimal_value', 15, 4)->nullable();
            $table->string('unit_of_measure')->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedBigInteger('created_by')->nullable()->constrained('users');
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
        Schema::dropIfExists('performance_benchmarks');
    }
};
