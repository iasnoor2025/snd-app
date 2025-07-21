<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('timesheets', function (Blueprint $table) {
            if (!Schema::hasColumn('timesheets', 'submitted_by')) {
                $table->unsignedBigInteger('submitted_by')->nullable()->after('status');
            }
        });
    }

    public function down()
    {
        Schema::table('timesheets', function (Blueprint $table) {
            if (Schema::hasColumn('timesheets', 'submitted_by')) {
                $table->dropColumn(['submitted_by']);
            }
        });
    }
};
