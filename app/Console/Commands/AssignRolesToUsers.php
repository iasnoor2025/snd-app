<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Spatie\Permission\Models\Role;

class AssignRolesToUsers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:assign-roles-to-users';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Assign default roles to users who don\'t have any roles';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking users without roles...');

        // Ensure the 'user' role exists
        $userRole = Role::firstOrCreate(['name' => 'user', 'guard_name' => 'web']);

        // Find users without any roles
        $usersWithoutRoles = User::whereDoesntHave('roles')->get();

        if ($usersWithoutRoles->isEmpty()) {
            $this->info('All users already have roles assigned.');
            return;
        }

        $count = 0;
        foreach ($usersWithoutRoles as $user) {
            $user->assignRole('user');
            $this->line("Assigned 'user' role to: {$user->name} ({$user->email})");
            $count++;
        }

        $this->info("Successfully assigned roles to {$count} users.");
    }
}
