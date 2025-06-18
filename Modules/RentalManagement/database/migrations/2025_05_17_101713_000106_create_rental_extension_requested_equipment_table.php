<?php
namespace Modules\RentalManagement\database\migrations;

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
        Schema::create('rental_extension_requested_equipment', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('rental_extension_request_id')
                ->constrained('rental_extension_requests')
                ->onDelete('cascade')
                ->name('fk_rental_extension_request');
            $table->unsignedBigInteger('equipment_id')
                ->constrained()
                ->name('fk_equipment');
            $table->integer('quantity');
            $table->boolean('needs_operator');
            $table->unsignedBigInteger('operator_id')
                ->nullable()
                ->constrained()
                ->name('fk_operator');
            $table->decimal('daily_rate', 10, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rental_extension_requested_equipment');
    }
};
