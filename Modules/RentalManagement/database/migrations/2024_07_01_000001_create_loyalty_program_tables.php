<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('loyalty_programs', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->integer('points_per_rental')->default(0);
            $table->timestamps();
        });

        Schema::create('loyalty_transactions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('loyalty_program_id');
            $table->unsignedBigInteger('customer_id');
            $table->unsignedBigInteger('rental_id')->nullable();
            $table->integer('points');
            $table->string('type'); // earned, redeemed, etc.
            $table->timestamps();

            $table->foreign('loyalty_program_id')->references('id')->on('loyalty_programs')->onDelete('cascade');
            $table->foreign('customer_id')->references('id')->on('customers')->onDelete('cascade');
            $table->foreign('rental_id')->references('id')->on('rentals')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loyalty_transactions');
        Schema::dropIfExists('loyalty_programs');
    }
};
