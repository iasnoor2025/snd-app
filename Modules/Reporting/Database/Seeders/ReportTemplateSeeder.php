<?php

namespace Modules\Reporting\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Reporting\Domain\Models\ReportTemplate;

class ReportTemplateSeeder extends Seeder
{
    public function run()
    {
        $templates = [
            [
                'name' => 'Monthly Payroll Report',
                'description' => 'Shows payroll summary for the month',
                'user_id' => 1,
                'parameters' => json_encode(['month' => 'April']),
                'data_source' => 'payroll',
                'is_public' => true,
            ],
            [
                'name' => 'Equipment Utilization',
                'description' => 'Utilization stats for all equipment',
                'user_id' => 1,
                'parameters' => json_encode(['period' => 'Q1']),
                'data_source' => 'equipment',
                'is_public' => false,
            ],
        ];
        foreach ($templates as $data) {
            ReportTemplate::updateOrCreate([
                'name' => $data['name'],
            ], $data);
        }
    }
}
