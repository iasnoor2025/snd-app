<?php

namespace Modules\Payroll\database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Payroll\Domain\Models\PayrollRun;

class PayrollRunSeeder extends Seeder
{
    public function run()
    {
        $runs = [
            [
                'batch_id' => 'PR-2024-001',
                'run_by' => 1,
                'status' => 'completed',
                'total_employees' => 10,
                'run_date' => now()->subMonth(),
                'notes' => 'March payroll',
                'completed_at' => now()->subMonth()->addDay(),
            ],
            [
                'batch_id' => 'PR-2024-002',
                'run_by' => 1,
                'status' => 'pending',
                'total_employees' => 12,
                'run_date' => now(),
                'notes' => 'April payroll',
                'completed_at' => null,
            ],
        ];
        foreach ($runs as $data) {
            PayrollRun::updateOrCreate([
                'batch_id' => $data['batch_id'],
            ], $data);
        }
    }
}
