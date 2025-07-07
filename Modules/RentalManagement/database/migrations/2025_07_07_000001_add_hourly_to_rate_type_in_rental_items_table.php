<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Drop the old check constraint (if exists) and add a new one including 'hourly'
        DB::statement("ALTER TABLE rental_items DROP CONSTRAINT IF EXISTS rental_items_rate_type_check;");
        DB::statement("ALTER TABLE rental_items ADD CONSTRAINT rental_items_rate_type_check CHECK (rate_type IN ('hourly', 'daily', 'weekly', 'monthly'));");
    }

    public function down(): void
    {
        // Revert to only daily, weekly, monthly
        DB::statement("ALTER TABLE rental_items DROP CONSTRAINT IF EXISTS rental_items_rate_type_check;");
        DB::statement("ALTER TABLE rental_items ADD CONSTRAINT rental_items_rate_type_check CHECK (rate_type IN ('daily', 'weekly', 'monthly'));");
    }
};
