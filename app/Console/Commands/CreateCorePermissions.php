<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use App\Models\User;

class CreateCorePermissions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'permissions:create-core';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create core permissions for users and roles management';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $permissions = [
            'users.view',
            'users.create', 
            'users.edit',
            'users.delete',
            'roles.view',
            'roles.create',
            'roles.edit', 
            'roles.delete',
            'permissions.view',
            'permissions.create',
            'permissions.edit',
            'permissions.delete'
        ];

        $this->info('Creating core permissions...');

        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'web'
            ]);
            $this->line("✓ Created permission: {$permission}");
        }

        // Make sure admin role exists and has all permissions
        $adminRole = Role::firstOrCreate([
            'name' => 'admin',
            'guard_name' => 'web'
        ]);

        $adminRole->syncPermissions(Permission::all());
        $this->info('✓ Admin role granted all permissions');

        // Assign admin role to first user if no admin exists
        $adminUser = User::whereHas('roles', function ($query) {
            $query->where('name', 'admin');
        })->first();

        if (!$adminUser) {
            $firstUser = User::first();
            if ($firstUser) {
                $firstUser->assignRole('admin');
                $this->info("✓ Assigned admin role to user: {$firstUser->email}");
            }
        }

        $this->info('Core permissions setup completed!');
        return 0;
    }
}
