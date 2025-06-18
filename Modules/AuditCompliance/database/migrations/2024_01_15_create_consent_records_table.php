<?php

namespace Modules\AuditCompliance\database\migrations;

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('consent_records', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('email'); // For non-registered users
            $table->string('consent_type'); // marketing, analytics, cookies, etc.
            $table->boolean('consent_given');
            $table->text('purpose'); // Purpose of data processing
            $table->text('legal_basis'); // Legal basis for processing
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->json('consent_details')->nullable(); // Additional consent details
            $table->timestamp('consent_date');
            $table->timestamp('expiry_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->index(['user_id', 'consent_type']);
            $table->index(['email', 'consent_type']);
            $table->index('consent_date');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('consent_records');
    }
};
