<?php

namespace Modules\PayrollManagement\database\Seeders;

use Illuminate\Database\Seeder;
use Modules\PayrollManagement\Models\PayrollDeduction;
use Modules\PayrollManagement\Models\DeductionRule;
use Modules\PayrollManagement\Domain\Models\Payroll;

class PayrollDeductionSeeder extends Seeder
{
    public function run(): void
    {
        // Only create payroll if there is at least one employee
        $employee = \Modules\EmployeeManagement\Domain\Models\Employee::first();
        if (!$employee) {
            return; // No employees, skip seeding
        }
        $payroll = \Modules\PayrollManagement\Domain\Models\Payroll::factory()->create(['employee_id' => $employee->id]);
        $rule = \Modules\PayrollManagement\Models\DeductionRule::factory()->create();

        // Create PayrollDeductions linked to the created payroll and rule
        \Modules\PayrollManagement\Models\PayrollDeduction::factory()
            ->count(3)
            ->create([
                'payroll_id' => $payroll->id,
                'rule_id' => $rule->id,
            ]);
    }
}
