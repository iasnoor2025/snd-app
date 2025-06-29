<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('employee_documents', function (Blueprint $table) {
            $table->integer('version')->default(1);
            $table->timestamp('expires_at')->nullable();
            $table->string('batch_id')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('employee_documents', function (Blueprint $table) {
            $table->dropColumn(['version', 'expires_at', 'batch_id']);
        });
    }
};
