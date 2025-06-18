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
        Schema::create('maintenance_history', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('equipment_id')->onDelete('cascade');
            $table->string('maintenance_type');
            $table->text('description');
            $table->decimal('cost', 10, 2);
            $table->unsignedBigInteger('performed_by')->nullable()->constrained('users');
            $table->timestamp('performed_at');
            $table->timestamp('next_maintenance_due')->nullable();
            $table->string('status');
            $table->json('parts_used')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('maintenance_history');
    }
};
