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
        Schema::create('equipment_depreciation', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('equipment_id')->onDelete('cascade');
            $table->decimal('initial_value', 12, 2);
            $table->decimal('residual_value', 12, 2);
            $table->decimal('current_value', 12, 2);
            $table->string('depreciation_method');
            $table->integer('useful_life_years');
            $table->date('depreciation_start_date');
            $table->date('last_depreciation_date')->nullable();
            $table->date('fully_depreciated_date')->nullable();
            $table->decimal('annual_depreciation_rate', 8, 4)->nullable();
            $table->decimal('annual_depreciation_amount', 12, 2)->nullable();
            $table->json('depreciation_schedule')->nullable();
            $table->json('depreciation_factors')->nullable();
            $table->unsignedBigInteger('created_by')->nullable()->constrained('users');
            $table->unsignedBigInteger('updated_by')->nullable()->constrained('users');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('equipment_depreciation');
    }
};
