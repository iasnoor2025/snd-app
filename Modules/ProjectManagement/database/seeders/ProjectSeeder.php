<?php

namespace Modules\ProjectManagement\database\seeders;

use Illuminate\Database\Seeder;
use Modules\ProjectManagement\Domain\Models\Project;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class ProjectSeeder extends Seeder
{
    public function run()
    {
        $projects = [
            [
                'name' => 'Office Tower Construction',
                'description' => 'Build a 20-story office tower downtown.',
                'start_date' => now()->subMonths(2),
                'end_date' => now()->addMonths(10),
                'status' => 'active',
                'budget' => 5000000,
                'manager_id' => 1,
                'client_name' => 'Acme Corp',
                'client_contact' => 'John Doe',
                'priority' => 'high',
                'progress' => 15.5,
            ],
            [
                'name' => 'Warehouse Renovation',
                'description' => 'Renovate and expand the main warehouse.',
                'start_date' => now()->subMonth(),
                'end_date' => now()->addMonths(4),
                'status' => 'planning',
                'budget' => 1200000,
                'manager_id' => 1,
                'client_name' => 'Beta LLC',
                'client_contact' => 'Jane Smith',
                'priority' => 'medium',
                'progress' => 0,
            ],
            [
                'name' => 'Bridge Repair',
                'description' => 'Repair the city bridge structure.',
                'start_date' => now()->addWeeks(2),
                'end_date' => now()->addMonths(6),
                'status' => 'scheduled',
                'budget' => 2000000,
                'manager_id' => 1,
                'client_name' => 'Gamma Inc',
                'client_contact' => 'Alice Johnson',
                'priority' => 'high',
                'progress' => 0,
            ],
        ];
        foreach ($projects as $data) {
            Project::updateOrCreate([
                'name' => $data['name'],
            ], $data);
        }

        // Ensure the permission exists
        $permission = Permission::firstOrCreate([
            'name' => 'manpower.create',
            'guard_name' => 'web',
        ]);

        // Assign to project_manager role
        $role = Role::firstOrCreate([
            'name' => 'project_manager',
            'guard_name' => 'web',
        ]);
        if (!$role->hasPermissionTo($permission)) {
            $role->givePermissionTo($permission);
        }
    }
}
