<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('advance_payments', function (Blueprint $table) {
            $table->decimal('repaid_amount', 10, 2)->default(0)->after('amount');
        });
    }

    public function down()
    {
        Schema::table('advance_payments', function (Blueprint $table) {
            $table->dropColumn('repaid_amount');
        });
    }
};
