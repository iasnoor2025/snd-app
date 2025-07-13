<?php

namespace Modules\EmployeeManagement\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\EmployeeManagement\Domain\Models\Designation;
use Modules\EmployeeManagement\Domain\Models\Department;

class DesignationSeeder extends Seeder
{
    public function run()
    {
        // For translatable fields stored as JSON, we need to search within the JSON
        $department = Department::where('name', 'like', '%General%')->first();

        if (!$department) {
            throw new \Exception('Department "General" not found.');
        }
        $designations = [
            ['name' => ['en' => 'Manager'], 'description' => ['en' => 'Manages the team'], 'is_active' => true, 'department_id' => $department->id],
            ['name' => ['en' => 'Engineer'], 'description' => ['en' => 'Handles engineering tasks'], 'is_active' => true, 'department_id' => $department->id],
            ['name' => ['en' => 'Technician'], 'description' => ['en' => 'Technical support'], 'is_active' => true, 'department_id' => $department->id],
            ['name' => ['en' => 'HR'], 'description' => ['en' => 'Human Resources'], 'is_active' => true, 'department_id' => $department->id],
            ['name' => ['en' => 'Accountant'], 'description' => ['en' => 'Handles accounts'], 'is_active' => true, 'department_id' => $department->id],
        ];

        foreach ($designations as $designation) {
            Designation::updateOrCreate(['name' => $designation['name']], $designation);
        }
    }
}
