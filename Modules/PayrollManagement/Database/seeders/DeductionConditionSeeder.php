<?php

namespace Modules\PayrollManagement\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\PayrollManagement\Models\DeductionCondition;
use Modules\PayrollManagement\Models\DeductionRule;

class DeductionConditionSeeder extends Seeder
{
    public function run(): void
    {
        // Create a DeductionRule first
        $rule = DeductionRule::factory()->create();

        // Create DeductionConditions linked to the created rule
        DeductionCondition::factory()
            ->count(3)
            ->create(['deduction_rule_id' => $rule->id]);
    }
}
