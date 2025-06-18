<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class GrantEquipmentPermissionsSeeder extends Seeder
{
    public function run()
    {
        $permissions = Permission::where('name', 'like', 'equipment.%')->pluck('name');
        // Assign to first user
        $user = User::first();
        if ($user) {
            $user->givePermissionTo($permissions);
        }
        // Assign to all admin users
        $adminRole = Role::where('name', 'admin')->first();
        if ($adminRole) {
            $adminRole->givePermissionTo($permissions);
        }
    }
}
