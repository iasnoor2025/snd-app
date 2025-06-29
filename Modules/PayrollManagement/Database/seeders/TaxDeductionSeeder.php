<?php

namespace Modules\PayrollManagement\database\Seeders;

use Illuminate\Database\Seeder;
use Modules\PayrollManagement\Models\TaxDeduction;
use Modules\PayrollManagement\Domain\Models\Payroll;

class TaxDeductionSeeder extends Seeder
{
    public function run(): void
    {
        $payroll = Payroll::first() ?? Payroll::factory()->create();
        TaxDeduction::factory()->count(3)->create(['payroll_id' => $payroll->id]);
    }
}
