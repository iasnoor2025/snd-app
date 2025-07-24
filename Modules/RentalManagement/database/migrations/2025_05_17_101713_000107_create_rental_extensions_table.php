<?php
namespace Modules\RentalManagement\Database\Migrations;

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
        Schema::create('rental_extensions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('rental_id')->cascadeOnDelete();
            $table->date('previous_end_date');
            $table->date('new_end_date');
            $table->text('reason');
            $table->string('status')->default('pending');
            $table->json('additional_equipment')->nullable();
            $table->boolean('keep_operators')->default(true);
            $table->unsignedBigInteger('approved_by')->nullable()->constrained('users');
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rental_extensions');
    }
};
