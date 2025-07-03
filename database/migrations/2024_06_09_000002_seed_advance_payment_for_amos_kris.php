<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up()
    {
        DB::table('advance_payments')->insert([
            'employee_id' => 52,
            'amount' => 73.25,
            'repaid_amount' => 0,
            'status' => 'approved',
            'purpose' => 'Legacy balance import',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down()
    {
        DB::table('advance_payments')
            ->where('employee_id', 52)
            ->where('amount', 73.25)
            ->where('status', 'approved')
            ->delete();
    }
};
