<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->decimal('initial_budget', 15, 2)->nullable()->after('budget');
            $table->decimal('current_budget', 15, 2)->nullable()->after('initial_budget');
            $table->string('budget_status')->nullable()->after('current_budget');
            $table->text('budget_notes')->nullable()->after('budget_status');
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn(['initial_budget', 'current_budget', 'budget_status', 'budget_notes']);
        });
    }
};
