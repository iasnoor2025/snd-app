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
            // Set up proper salary data for the employee if not already set
            if (!$employee->basic_salary || $employee->basic_salary == 0) {
                $employee->update([
                    'basic_salary' => 5000.00,
                    'food_allowance' => 500.00,
                    'housing_allowance' => 1000.00,
                    'transport_allowance' => 300.00,
                ]);
            }

            // Create a salary increment for each employee with meaningful salary values
            $currentBaseSalary = $employee->basic_salary * 0.9; // 10% lower than current
            $currentFoodAllowance = $employee->food_allowance * 0.9;
            $currentHousingAllowance = $employee->housing_allowance * 0.9;
            $currentTransportAllowance = $employee->transport_allowance * 0.9;

            SalaryIncrement::create([
                'employee_id' => $employee->id,
                'current_base_salary' => $currentBaseSalary,
                'new_base_salary' => $employee->basic_salary,
                'current_food_allowance' => $currentFoodAllowance,
                'new_food_allowance' => $employee->food_allowance,
                'current_housing_allowance' => $currentHousingAllowance,
                'new_housing_allowance' => $employee->housing_allowance,
                'current_transport_allowance' => $currentTransportAllowance,
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

            // Create another increment for recent months with higher values
            $newBaseSalary = $employee->basic_salary * 1.05;
            $newFoodAllowance = $employee->food_allowance * 1.05;
            $newHousingAllowance = $employee->housing_allowance * 1.05;
            $newTransportAllowance = $employee->transport_allowance * 1.05;

            SalaryIncrement::create([
                'employee_id' => $employee->id,
                'current_base_salary' => $employee->basic_salary,
                'new_base_salary' => $newBaseSalary,
                'current_food_allowance' => $employee->food_allowance,
                'new_food_allowance' => $newFoodAllowance,
                'current_housing_allowance' => $employee->housing_allowance,
                'new_housing_allowance' => $newHousingAllowance,
                'current_transport_allowance' => $employee->transport_allowance,
                'new_transport_allowance' => $newTransportAllowance,
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
