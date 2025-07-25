<?php

namespace Modules\PayrollManagement\Database\Seeders;

use Illuminate\Database\Seeder;

class PayrollManagementDatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->call([
            DeductionConditionSeeder::class,
            PayrollDeductionSeeder::class,
            DeductionTemplateSeeder::class,
            DeductionRuleSeeder::class,
            TaxDeductionSeeder::class,
            TaxBracketSeeder::class,
            TaxRuleSeeder::class,
        ]);
    }
}
