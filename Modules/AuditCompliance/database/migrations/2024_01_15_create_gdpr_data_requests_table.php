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
        Schema::create('gdpr_data_requests', function (Blueprint $table) {
            $table->id();
            $table->string('request_id')->unique(); // Unique identifier for the request
            $table->enum('type', ['access', 'rectification', 'erasure', 'portability', 'restriction', 'objection']);
            $table->enum('status', ['pending', 'in_progress', 'completed', 'rejected', 'cancelled']);
            $table->string('subject_email'); // Email of the data subject
            $table->string('subject_name')->nullable();
            $table->text('description')->nullable();
            $table->json('requested_data')->nullable(); // Specific data requested
            $table->text('legal_basis')->nullable(); // Legal basis for processing
            $table->date('requested_at');
            $table->date('due_date'); // 30 days from request
            $table->unsignedBigInteger('assigned_to')->nullable();
            $table->text('response_notes')->nullable();
            $table->text('file_path')->nullable(); // Path to response file
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->foreign('assigned_to')->references('id')->on('users')->onDelete('set null');
            $table->index(['type', 'status']);
            $table->index('subject_email');
            $table->index('due_date');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('gdpr_data_requests');
    }
};
