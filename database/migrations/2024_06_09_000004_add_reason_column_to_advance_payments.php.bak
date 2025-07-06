<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up()
    {
        Schema::table('advance_payments', function (Blueprint $table) {
            $table->string('reason')->nullable()->after('purpose');
        });
        // Copy data from purpose to reason
        DB::statement('UPDATE advance_payments SET reason = purpose WHERE purpose IS NOT NULL');
    }

    public function down()
    {
        Schema::table('advance_payments', function (Blueprint $table) {
            $table->dropColumn('reason');
        });
    }
};
