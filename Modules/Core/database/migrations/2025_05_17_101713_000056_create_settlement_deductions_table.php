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
        Schema::create('settlement_deductions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('final_settlement_id')->cascadeOnDelete();
            $table->string('type');
            $table->string('description');
            $table->decimal('amount', 10, 2);
            $table->string('reference_number')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settlement_deductions');
    }
};
