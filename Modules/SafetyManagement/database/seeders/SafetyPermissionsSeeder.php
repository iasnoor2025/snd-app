<?php

namespace Modules\SafetyManagement\Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class SafetyPermissionsSeeder extends Seeder
{
    public function run()
    {
        $permissions = [
            'incidents.view', 'incidents.create', 'incidents.update', 'incidents.delete', 'incidents.approve',
            'inspections.view', 'inspections.create', 'inspections.update', 'inspections.delete', 'inspections.approve',
            'risks.view', 'risks.create', 'risks.update', 'risks.delete',
            'training_records.view', 'training_records.create', 'training_records.update', 'training_records.delete',
            'ppe_checks.view', 'ppe_checks.create', 'ppe_checks.update', 'ppe_checks.delete',
            'safety_actions.view', 'safety_actions.create', 'safety_actions.update', 'safety_actions.delete',
        ];
        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }
        $operator = Role::firstOrCreate(['name' => 'operator']);
        $supervisor = Role::firstOrCreate(['name' => 'supervisor']);
        $manager = Role::firstOrCreate(['name' => 'safety_manager']);
        $operator->givePermissionTo([
            'incidents.view', 'incidents.create',
            'inspections.view', 'inspections.create',
            'risks.view',
            'training_records.view',
            'ppe_checks.view', 'ppe_checks.create',
            'safety_actions.view',
        ]);
        $supervisor->givePermissionTo($permissions);
        $manager->givePermissionTo($permissions);
    }
}
