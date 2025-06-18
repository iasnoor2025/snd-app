<?php

namespace Database\Seeders;

use Modules\Core\Domain\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user if it doesn't exist
        $admin = User::firstOrCreate(
            ['email' => 'admin@ias.com'],
            [
                'name' => 'System Administrator',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        // Assign admin role to the user
        if (!$admin->hasRole('admin', 'web')) {
            $admin->assignRole('admin');
        }

        // Create manager user for testing
        $manager = User::firstOrCreate(
            ['email' => 'manager@rental.com'],
            [
                'name' => 'Rental Manager',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        if (!$manager->hasRole('manager', 'web')) {
            $manager->assignRole('manager');
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

        if (!$employee->hasRole('employee', 'web')) {
            $employee->assignRole('employee');
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

        if (!$hr->hasRole('hr', 'web')) {
            $hr->assignRole('hr');
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

        if (!$accountant->hasRole('accountant', 'web')) {
            $accountant->assignRole('accountant');
        }
    }
}
