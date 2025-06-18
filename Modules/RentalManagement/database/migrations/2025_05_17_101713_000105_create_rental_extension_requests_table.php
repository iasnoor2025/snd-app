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
        Schema::create('rental_extension_requests', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('rental_id')->onDelete('cascade');
            $table->unsignedBigInteger('requested_by')->onDelete('cascade');
            $table->date('current_end_date');
            $table->date('requested_end_date');
            $table->text('reason');
            $table->boolean('keep_operators')->nullable();
            $table->json('additional_equipment')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('response_note')->nullable();
            $table->unsignedBigInteger('responded_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('responded_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rental_extension_requests');
    }
};
