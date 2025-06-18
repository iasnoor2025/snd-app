<?php

namespace Modules\EmployeeManagement\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\EmployeeManagement\Domain\Models\Employee;
use Modules\EmployeeManagement\Domain\Models\SalaryIncrement;
use Carbon\Carbon;

class SalaryIncrementSeeder extends Seeder
{
    public function run()
    {
        // Get all employees
        $employees = Employee::all();

        foreach ($employees as $employee) {
            // Create a salary increment for each employee with their current salary as the "new" values
            SalaryIncrement::create([
                'employee_id' => $employee->id,
                'current_base_salary' => $employee->basic_salary * 0.9, // Simulate previous salary
                'new_base_salary' => $employee->basic_salary,
                'current_food_allowance' => $employee->food_allowance * 0.9,
                'new_food_allowance' => $employee->food_allowance,
                'current_housing_allowance' => $employee->housing_allowance * 0.9,
                'new_housing_allowance' => $employee->housing_allowance,
                'current_transport_allowance' => $employee->transport_allowance * 0.9,
                'new_transport_allowance' => $employee->transport_allowance,
                'increment_type' => 'annual_review',
                'increment_percentage' => 10.0,
                'reason' => 'Annual salary review',
                'effective_date' => Carbon::now()->subMonths(6),
                'requested_by' => 1, // Assuming user ID 1 exists
                'requested_at' => Carbon::now()->subMonths(6)->subDays(5),
                'approved_by' => 1,
                'approved_at' => Carbon::now()->subMonths(6)->subDays(3),
                'status' => 'approved',
                'notes' => 'Annual performance review increment',
            ]);

            // Create another increment for recent months
            SalaryIncrement::create([
                'employee_id' => $employee->id,
                'current_base_salary' => $employee->basic_salary,
                'new_base_salary' => $employee->basic_salary * 1.05,
                'current_food_allowance' => $employee->food_allowance,
                'new_food_allowance' => $employee->food_allowance * 1.05,
                'current_housing_allowance' => $employee->housing_allowance,
                'new_housing_allowance' => $employee->housing_allowance * 1.05,
                'current_transport_allowance' => $employee->transport_allowance,
                'new_transport_allowance' => $employee->transport_allowance * 1.05,
                'increment_type' => 'performance',
                'increment_percentage' => 5.0,
                'reason' => 'Performance-based increment',
                'effective_date' => Carbon::now()->subMonths(1),
                'requested_by' => 1,
                'requested_at' => Carbon::now()->subMonths(1)->subDays(10),
                'approved_by' => 1,
                'approved_at' => Carbon::now()->subMonths(1)->subDays(7),
                'status' => 'approved',
                'notes' => 'Excellent performance review',
            ]);
        }
    }
}
