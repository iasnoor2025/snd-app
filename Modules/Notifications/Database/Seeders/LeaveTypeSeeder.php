<?php

namespace Modules\Notifications\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Notifications\Domain\Models\LeaveType;

class LeaveTypeSeeder extends Seeder
{
    public function run()
    {
        $types = [
            [
                'name' => 'Annual Leave',
                'description' => 'Annual paid leave',
                'days_per_year' => 30,
                'color' => '#4caf50',
                'is_active' => true,
            ],
            [
                'name' => 'Sick Leave',
                'description' => 'Paid sick leave',
                'days_per_year' => 10,
                'color' => '#f44336',
                'is_active' => true,
            ],
        ];
        foreach ($types as $data) {
            LeaveType::updateOrCreate([
                'name' => $data['name'],
            ], $data);
        }
    }
}
