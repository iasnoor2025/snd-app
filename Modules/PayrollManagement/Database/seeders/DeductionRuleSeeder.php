<?php

namespace Modules\PayrollManagement\database\seeders;

use Illuminate\Database\Seeder;
use Modules\PayrollManagement\Models\DeductionRule;

class DeductionRuleSeeder extends Seeder
{
    public function run(): void
    {
        DeductionRule::factory()->count(3)->create();
    }
} 