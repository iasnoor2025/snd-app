<?php

namespace Modules\PayrollManagement\database\seeders;

use Illuminate\Database\Seeder;
use Modules\PayrollManagement\Models\TaxRule;

class TaxRuleSeeder extends Seeder
{
    public function run(): void
    {
        TaxRule::factory()->count(3)->create();
    }
} 