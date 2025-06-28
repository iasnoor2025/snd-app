<?php

namespace Modules\PayrollManagement\database\seeders;

use Illuminate\Database\Seeder;
use Modules\PayrollManagement\Models\TaxBracket;
use Modules\PayrollManagement\Models\TaxRule;

class TaxBracketSeeder extends Seeder
{
    public function run(): void
    {
        $taxRule = TaxRule::first() ?? TaxRule::factory()->create();
        TaxBracket::factory()->count(3)->create(['tax_rule_id' => $taxRule->id]);
    }
} 