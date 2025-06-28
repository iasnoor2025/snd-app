<?php

namespace Modules\PayrollManagement\database\seeders;

use Illuminate\Database\Seeder;
use Modules\PayrollManagement\Models\PayrollDeduction;
use Modules\PayrollManagement\Models\DeductionRule;
use Modules\Payroll\Domain\Models\Payroll;

class PayrollDeductionSeeder extends Seeder
{
    public function run(): void
    {
        // Create a payroll and a deduction rule first
        $payroll = Payroll::factory()->create();
        $rule = DeductionRule::factory()->create();

        // Create PayrollDeductions linked to the created payroll and rule
        PayrollDeduction::factory()
            ->count(3)
            ->create([
                'payroll_id' => $payroll->id,
                'rule_id' => $rule->id,
            ]);
    }
} 