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
        Schema::create('data_retention_policies', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('data_type'); // audit_logs, user_data, financial_records, etc.
            $table->integer('retention_days'); // How many days to retain
            $table->boolean('auto_delete')->default(false);
            $table->json('conditions')->nullable(); // Additional conditions for retention
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_executed_at')->nullable();
            $table->timestamps();

            $table->index(['data_type', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('data_retention_policies');
    }
};
