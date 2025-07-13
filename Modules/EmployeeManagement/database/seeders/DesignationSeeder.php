<?php

namespace Modules\EmployeeManagement\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\EmployeeManagement\Domain\Models\Designation;
use Modules\EmployeeManagement\Domain\Models\Department;

class DesignationSeeder extends Seeder
{
    public function run()
    {
        $department = Department::first();
        if (!$department) {
            $department = Department::create([
                'name' => 'General',
                'description' => 'General department',
                'active' => true,
            ]);
        }
        $designations = [
            // World default company designation seed with foreman, operation, rental, timesheet roles
            ['name' => ['en' => 'Chief Executive Officer'], 'description' => ['en' => 'Leads the company and makes major decisions'], 'is_active' => true, 'department_id' => $department->id],
            ['name' => ['en' => 'Chief Operating Officer'], 'description' => ['en' => 'Oversees daily operations'], 'is_active' => true, 'department_id' => $department->id],
            ['name' => ['en' => 'Chief Financial Officer'], 'description' => ['en' => 'Manages company finances'], 'is_active' => true, 'department_id' => $department->id],
            ['name' => ['en' => 'Chief Technology Officer'], 'description' => ['en' => 'Leads technology and development'], 'is_active' => true, 'department_id' => $department->id],
            ['name' => ['en' => 'Chief Marketing Officer'], 'description' => ['en' => 'Leads marketing strategies'], 'is_active' => true, 'department_id' => $department->id],
            ['name' => ['en' => 'General Manager'], 'description' => ['en' => 'Oversees all company operations'], 'is_active' => true, 'department_id' => $department->id],
            ['name' => ['en' => 'Department Manager'], 'description' => ['en' => 'Manages a specific department'], 'is_active' => true, 'department_id' => $department->id],
            ['name' => ['en' => 'Assistant Manager'], 'description' => ['en' => 'Assists the manager in daily tasks'], 'is_active' => true, 'department_id' => $department->id],
            ['name' => ['en' => 'Supervisor'], 'description' => ['en' => 'Supervises teams and processes'], 'is_active' => true, 'department_id' => $department->id],
            ['name' => ['en' => 'Foreman'], 'description' => ['en' => 'Supervises workers and operations on site'], 'is_active' => true, 'department_id' => $department->id],
            ['name' => ['en' => 'Operation Manager'], 'description' => ['en' => 'Manages operations and processes'], 'is_active' => true, 'department_id' => $department->id],
            ['name' => ['en' => 'Operation Supervisor'], 'description' => ['en' => 'Supervises operational activities'], 'is_active' => true, 'department_id' => $department->id],
            ['name' => ['en' => 'Operation Foreman'], 'description' => ['en' => 'Leads operational teams on site'], 'is_active' => true, 'department_id' => $department->id],
            ['name' => ['en' => 'Operation Operator'], 'description' => ['en' => 'Operates equipment in operations'], 'is_active' => true, 'department_id' => $department->id],
            ['name' => ['en' => 'Rental Manager'], 'description' => ['en' => 'Manages rental operations'], 'is_active' => true, 'department_id' => $department->id],
            ['name' => ['en' => 'Rental Supervisor'], 'description' => ['en' => 'Supervises rental activities'], 'is_active' => true, 'department_id' => $department->id],
            ['name' => ['en' => 'Rental Foreman'], 'description' => ['en' => 'Leads rental teams on site'], 'is_active' => true, 'department_id' => $department->id],
            ['name' => ['en' => 'Rental Operator'], 'description' => ['en' => 'Operates equipment for rental'], 'is_active' => true, 'department_id' => $department->id],
            ['name' => ['en' => 'Timesheet Manager'], 'description' => ['en' => 'Manages timesheet processes'], 'is_active' => true, 'department_id' => $department->id],
            ['name' => ['en' => 'Timesheet Supervisor'], 'description' => ['en' => 'Supervises timesheet activities'], 'is_active' => true, 'department_id' => $department->id],
            ['name' => ['en' => 'Timesheet Foreman'], 'description' => ['en' => 'Leads timesheet teams on site'], 'is_active' => true, 'department_id' => $department->id],
            ['name' => ['en' => 'Timesheet Operator'], 'description' => ['en' => 'Operates timesheet systems'], 'is_active' => true, 'department_id' => $department->id],
            ['name' => ['en' => 'Engineer'], 'description' => ['en' => 'Performs engineering work'], 'is_active' => true, 'department_id' => $department->id],
            ['name' => ['en' => 'Technician'], 'description' => ['en' => 'Provides technical support'], 'is_active' => true, 'department_id' => $department->id],
            ['name' => ['en' => 'Accountant'], 'description' => ['en' => 'Manages accounts and finances'], 'is_active' => true, 'department_id' => $department->id],
            ['name' => ['en' => 'HR Specialist'], 'description' => ['en' => 'Handles human resources tasks'], 'is_active' => true, 'department_id' => $department->id],
            ['name' => ['en' => 'Receptionist'], 'description' => ['en' => 'Manages front desk and visitors'], 'is_active' => true, 'department_id' => $department->id],
            ['name' => ['en' => 'Security Officer'], 'description' => ['en' => 'Ensures safety and security'], 'is_active' => true, 'department_id' => $department->id],
            ['name' => ['en' => 'Cleaner'], 'description' => ['en' => 'Maintains cleanliness of premises'], 'is_active' => true, 'department_id' => $department->id],
            ['name' => ['en' => 'Driver'], 'description' => ['en' => 'Transports people and goods'], 'is_active' => true, 'department_id' => $department->id],
            ['name' => ['en' => 'Operator'], 'description' => ['en' => 'Operates machinery or equipment'], 'is_active' => true, 'department_id' => $department->id],
            ['name' => ['en' => 'Laborer'], 'description' => ['en' => 'Performs manual labor tasks'], 'is_active' => true, 'department_id' => $department->id],
        ];
        foreach ($designations as $designation) {
            Designation::updateOrCreate(['name' => $designation['name']], $designation);
        }
    }
}
