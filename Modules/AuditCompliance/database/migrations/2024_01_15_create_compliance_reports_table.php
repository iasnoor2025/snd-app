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
        Schema::create('compliance_reports', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('type', ['gdpr', 'audit', 'security', 'financial', 'operational']);
            $table->enum('status', ['pending', 'in_progress', 'completed', 'failed']);
            $table->date('report_date');
            $table->date('period_start');
            $table->date('period_end');
            $table->json('parameters')->nullable(); // Report generation parameters
            $table->json('findings')->nullable(); // Report findings and results
            $table->text('file_path')->nullable(); // Path to generated report file
            $table->unsignedBigInteger('generated_by')->nullable();
            $table->timestamp('generated_at')->nullable();
            $table->timestamps();

            $table->foreign('generated_by')->references('id')->on('users')->onDelete('set null');
            $table->index(['type', 'status']);
            $table->index('report_date');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('compliance_reports');
    }
};
