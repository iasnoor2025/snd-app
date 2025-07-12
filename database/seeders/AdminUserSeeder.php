<?php

namespace Database\Seeders;

use Modules\Core\Domain\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin role if it doesn't exist
        $adminRole = Role::firstOrCreate(['name' => 'admin']);

        // Create permissions if they don't exist
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
            'permissions.delete',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Ensure admin role has all permissions
        $adminRole->syncPermissions(Permission::all());

        // Create admin user if it doesn't exist
        $admin = User::firstOrCreate(
            ['email' => 'admin@ias.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        // Assign admin role to admin user
        $admin->assignRole($adminRole);
        // Ensure admin user has all permissions
        $admin->syncPermissions(Permission::all());

        // Create manager user for testing
        $manager = User::firstOrCreate(
            ['email' => 'manager@rental.com'],
            [
                'name' => 'Rental Manager',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        // Ensure manager role exists and assign it
        $managerRole = Role::firstOrCreate(['name' => 'manager', 'guard_name' => 'web']);
        if (!$manager->hasRole($managerRole)) {
            $manager->assignRole($managerRole);
        }

        // Create employee user for testing
        $employee = User::firstOrCreate(
            ['email' => 'employee@rental.com'],
            [
                'name' => 'Test Employee',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        // Ensure employee role exists and assign it
        $employeeRole = Role::firstOrCreate(['name' => 'employee', 'guard_name' => 'web']);
        if (!$employee->hasRole($employeeRole)) {
            $employee->assignRole($employeeRole);
        }

        // Create HR user for testing
        $hr = User::firstOrCreate(
            ['email' => 'hr@rental.com'],
            [
                'name' => 'HR Manager',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        // Ensure HR role exists and assign it
        $hrRole = Role::firstOrCreate(['name' => 'hr', 'guard_name' => 'web']);
        if (!$hr->hasRole($hrRole)) {
            $hr->assignRole($hrRole);
        }

        // Create accountant user for testing
        $accountant = User::firstOrCreate(
            ['email' => 'accountant@rental.com'],
            [
                'name' => 'Chief Accountant',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        // Ensure accountant role exists and assign it
        $accountantRole = Role::firstOrCreate(['name' => 'accountant', 'guard_name' => 'web']);
        if (!$accountant->hasRole($accountantRole)) {
            $accountant->assignRole($accountantRole);
        }
    }
}
