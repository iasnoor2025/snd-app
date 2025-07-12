<?php

namespace Modules\PayrollManagement\database\Seeders;

use Illuminate\Database\Seeder;
use Modules\PayrollManagement\Models\TaxDeduction;
use Modules\PayrollManagement\Domain\Models\Payroll;

class TaxDeductionSeeder extends Seeder
{
    public function run(): void
    {
        $employee = \Modules\EmployeeManagement\Domain\Models\Employee::first();
        if (!$employee) {
            return; // No employees, skip seeding
        }
        $payroll = \Modules\PayrollManagement\Domain\Models\Payroll::factory()->create(['employee_id' => $employee->id]);
        \Modules\PayrollManagement\Models\TaxDeduction::factory()->count(3)->create(['payroll_id' => $payroll->id]);
    }
}
