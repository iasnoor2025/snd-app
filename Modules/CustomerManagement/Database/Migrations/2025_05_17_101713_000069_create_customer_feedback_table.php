<?php

namespace Modules\CustomerManagement\Database\Migrations;

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
        Schema::create('customer_feedback', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('customer_id')->onDelete('cascade');
            $table->unsignedBigInteger('rental_id')->nullable()->constrained('rentals')->onDelete('set null');
            $table->unsignedBigInteger('equipment_id')->nullable()->constrained('equipment')->onDelete('set null');
            $table->integer('rating');
            $table->text('feedback');
            $table->string('feedback_type');
            $table->string('status');
            $table->unsignedBigInteger('assigned_to')->nullable()->constrained('users');
            $table->text('response')->nullable();
            $table->timestamp('responded_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customer_feedback');
    }
};
