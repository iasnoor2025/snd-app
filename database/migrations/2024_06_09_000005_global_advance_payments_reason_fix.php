<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up()
    {
        // Copy 'purpose' to 'reason' where 'reason' is null and 'purpose' is not null
        DB::statement("UPDATE advance_payments SET reason = purpose WHERE reason IS NULL AND purpose IS NOT NULL");
        // Set a default reason if both are null
        DB::statement("UPDATE advance_payments SET reason = 'Advance payment' WHERE reason IS NULL");
    }

    public function down()
    {
        // Optionally clear the reason field (not recommended in production)
        // DB::statement("UPDATE advance_payments SET reason = NULL");
    }
};
