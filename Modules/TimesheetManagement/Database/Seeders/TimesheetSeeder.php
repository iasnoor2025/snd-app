<?php

namespace Modules\TimesheetManagement\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\TimesheetManagement\Domain\Models\Timesheet;

class TimesheetSeeder extends Seeder
{
    public function run()
    {
        $timesheets = [
            [
                'employee_id' => 1,
                'date' => now()->subDays(2),
                'hours_worked' => 8,
                'overtime_hours' => 2,
                'project_id' => 1,
                'description' => 'Worked on project A',
                'status' => 'approved',
                'created_by' => 1,
                'start_time' => '08:00:00',
                'end_time' => '16:00:00',
            ],
            [
                'employee_id' => 2,
                'date' => now()->subDay(),
                'hours_worked' => 7.5,
                'overtime_hours' => 0,
                'project_id' => 2,
                'description' => 'Worked on project B',
                'status' => 'pending',
                'created_by' => 1,
                'start_time' => '09:00:00',
                'end_time' => '16:30:00',
            ],
        ];
        foreach ($timesheets as $data) {
            Timesheet::updateOrCreate([
                'employee_id' => $data['employee_id'],
                'date' => $data['date'],
            ], $data);
        }
    }
}
