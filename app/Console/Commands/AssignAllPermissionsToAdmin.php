<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class AssignAllPermissionsToAdmin extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'role:assign-all-permissions-to-admin';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Assign all available permissions to the admin role';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Get the admin role
        $adminRole = Role::where('name', 'admin')->first();
        
        if (!$adminRole) {
            $this->error('Admin role not found. Please run the role seeder first.');
            return;
        }

        // Get all permissions
        $allPermissions = Permission::all();
        
        if ($allPermissions->isEmpty()) {
            $this->error('No permissions found. Please run the permission seeder first.');
            return;
        }

        // Get current permissions
        $currentPermissions = $adminRole->permissions->pluck('name')->toArray();
        $allPermissionNames = $allPermissions->pluck('name')->toArray();
        
        // Find missing permissions
        $missingPermissions = array_diff($allPermissionNames, $currentPermissions);
        
        if (empty($missingPermissions)) {
            $this->info('Admin role already has all permissions.');
            $this->info('Total permissions: ' . count($allPermissionNames));
            return;
        }

        // Assign all permissions to admin role
        $adminRole->syncPermissions($allPermissions);
        
        $this->info('Successfully assigned all permissions to admin role.');
        $this->info('Total permissions assigned: ' . count($allPermissionNames));
        $this->info('New permissions added: ' . count($missingPermissions));
        
        if (count($missingPermissions) <= 20) {
            $this->info('New permissions: ' . implode(', ', $missingPermissions));
        } else {
            $this->info('Too many new permissions to list individually.');
        }
    }
}
