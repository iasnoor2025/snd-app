<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class CreateAdminUser extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:create-admin {email=admin@ias.com} {password=password}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create an admin user with all permissions';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        $password = $this->argument('password');

        // Check if user already exists
        $existingUser = User::where('email', $email)->first();
        if ($existingUser) {
            $this->info("User with email {$email} already exists.");
            
            // Ensure they have admin role
            if (!$existingUser->hasRole('admin')) {
                $existingUser->assignRole('admin');
                $this->info("Assigned admin role to existing user.");
            }
            
            return;
        }

        // Create the user
        $user = User::create([
            'name' => 'Administrator',
            'email' => $email,
            'password' => Hash::make($password),
            'email_verified_at' => now(),
        ]);

        // Assign admin role
        $adminRole = Role::where('name', 'admin')->first();
        if ($adminRole) {
            $user->assignRole($adminRole);
            $this->info("Created admin user with email: {$email}");
            $this->info("Password: {$password}");
            $this->info("User has been assigned the admin role with all permissions.");
        } else {
            $this->error("Admin role not found. Please run the role seeder first.");
        }
    }
}
