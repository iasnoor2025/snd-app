<?php

namespace Modules\EmployeeManagement\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\EmployeeManagement\Domain\Models\Employee;

class EmployeeSeeder extends Seeder
{
    public function run()
    {
        $employees = [
            [
                'employee_id' => 'EMP-0001',
                'first_name' => 'John',
                'last_name' => 'Worker',
                'email' => 'john.worker@example.com',
                'phone' => '+1111111111',
                'department_id' => 1,
                'position_id' => 1,
                'status' => 'active',
                'basic_salary' => 5000.00,
                'food_allowance' => 500.00,
                'housing_allowance' => 1000.00,
                'transport_allowance' => 300.00,
            ],
            [
                'employee_id' => 'EMP-0002',
                'first_name' => 'Jane',
                'last_name' => 'Staff',
                'email' => 'jane.staff@example.com',
                'phone' => '+1222222222',
                'department_id' => 1,
                'position_id' => 2,
                'status' => 'active',
                'basic_salary' => 4500.00,
                'food_allowance' => 450.00,
                'housing_allowance' => 900.00,
                'transport_allowance' => 250.00,
            ],
            [
                'employee_id' => 'EMP-0003',
                'first_name' => 'Alice',
                'last_name' => 'Crew',
                'email' => 'alice.crew@example.com',
                'phone' => '+1333333333',
                'department_id' => 2,
                'position_id' => 3,
                'status' => 'inactive',
                'basic_salary' => 3500.00,
                'food_allowance' => 400.00,
                'housing_allowance' => 800.00,
                'transport_allowance' => 200.00,
            ],
        ];
        foreach ($employees as $data) {
            Employee::updateOrCreate([
                'email' => $data['email'],
            ], $data);
        }
    }
}
