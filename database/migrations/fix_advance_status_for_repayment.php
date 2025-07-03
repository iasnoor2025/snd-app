<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up()
    {
        // Set status to 'approved' for advances with remaining balance and not already approved/partially_repaid/paid/rejected
        DB::table('advance_payments')
            ->whereRaw('amount > repaid_amount')
            ->whereNotIn('status', ['approved', 'partially_repaid', 'paid', 'rejected'])
            ->update(['status' => 'approved']);
    }

    public function down()
    {
        // No rollback for this fix
    }
};
