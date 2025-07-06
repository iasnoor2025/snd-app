<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up()
    {
        DB::table('advance_payments')
            ->where('employee_id', 52)
            ->where('amount', 73.25)
            ->update(['reason' => 'Legacy balance import']);
    }

    public function down()
    {
        DB::table('advance_payments')
            ->where('employee_id', 52)
            ->where('amount', 73.25)
            ->update(['reason' => null]);
    }
};
