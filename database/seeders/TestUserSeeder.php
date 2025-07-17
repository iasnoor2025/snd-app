<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Core\Domain\Models\User;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class TestUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin role if it doesn't exist
        $adminRole = Role::firstOrCreate([
            'name' => 'admin',
            'guard_name' => 'web'
        ]);

        // Create test admin user
        $user = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'email' => 'admin@example.com',
                'password' => Hash::make('password'),
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        // Assign admin role
        if (!$user->hasRole('admin')) {
            $user->assignRole($adminRole);
        }

        $this->command->info('Test admin user created:');
        $this->command->info('Email: admin@example.com');
        $this->command->info('Password: password');
    }
}
