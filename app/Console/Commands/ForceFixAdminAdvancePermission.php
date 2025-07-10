<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Modules\Core\Domain\Models\User;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class ForceFixAdminAdvancePermission extends Command
{
    protected $signature = 'fix:admin-advance-permission';
    protected $description = 'Force assign advances.approve permission to admin role and admin user (web guard)';

    public function handle()
    {
        $user = User::where('email', 'admin@ias.com')->first();
        $role = Role::where('name', 'admin')->first();
        $perm = Permission::where('name', 'advances.approve')->first();
        if (!$user || !$role || !$perm) {
            $this->error('Missing admin user, role, or advances.approve permission.');
            return 1;
        }
        // Fix guard_name if needed
        if ($perm->guard_name !== 'web') {
            $perm->guard_name = 'web';
            $perm->save();
        }
        if ($role->guard_name !== 'web') {
            $role->guard_name = 'web';
            $role->save();
        }
        if (!$user->hasRole($role->name)) {
            $user->assignRole($role);
        }
        if (!$user->hasPermissionTo($perm->name)) {
            $user->givePermissionTo($perm->name);
        }
        if (!$role->hasPermissionTo($perm->name)) {
            $role->givePermissionTo($perm->name);
        }
        $this->info('Admin user and role now have advances.approve permission (web guard).');
        return 0;
    }
}
