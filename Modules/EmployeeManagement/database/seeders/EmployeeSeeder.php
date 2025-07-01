<?php

namespace Modules\EmployeeManagement\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\EmployeeManagement\Domain\Models\Employee;

class EmployeeSeeder extends Seeder
{
    public function run()
    {
        // Ensure departments and positions exist before running this seeder
        // \Modules\EmployeeManagement\Database\Seeders\DepartmentSeeder and PositionSeeder should be run first

        \DB::table('employees')->truncate();
        \DB::table('users')->truncate();

        $departmentIds = \Modules\EmployeeManagement\Domain\Models\Department::pluck('id')->toArray();
        $positionIds = \Modules\EmployeeManagement\Domain\Models\Position::pluck('id')->toArray();

        // Create 100 users
        $users = \Modules\Core\Domain\Models\User::factory()->count(100)->create();

        foreach ($users as $user) {
            \Modules\EmployeeManagement\Domain\Models\Employee::factory()->create([
                'user_id' => $user->id,
                'department_id' => fake()->randomElement($departmentIds),
                'position_id' => fake()->randomElement($positionIds),
                'email' => $user->email, // ensure employee email matches user
            ]);
        }
    }
}
