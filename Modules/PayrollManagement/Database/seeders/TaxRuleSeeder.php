<?php

namespace Modules\PayrollManagement\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\PayrollManagement\Models\TaxRule;

class TaxRuleSeeder extends Seeder
{
    public function run(): void
    {
        TaxRule::factory()->count(3)->create();
    }
}
