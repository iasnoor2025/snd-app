<?php

namespace Modules\PayrollManagement\database\seeders;

use Illuminate\Database\Seeder;
use Modules\PayrollManagement\Models\DeductionTemplate;

class DeductionTemplateSeeder extends Seeder
{
    public function run(): void
    {
        DeductionTemplate::factory()->count(3)->create();
    }
} 