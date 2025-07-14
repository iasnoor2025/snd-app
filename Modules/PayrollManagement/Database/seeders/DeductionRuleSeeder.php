<?php

namespace Modules\PayrollManagement\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\PayrollManagement\Models\DeductionRule;

class DeductionRuleSeeder extends Seeder
{
    public function run(): void
    {
        DeductionRule::factory()->count(3)->create();
    }
}
