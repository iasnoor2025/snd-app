<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Modules\Core\Domain\Models\User;
use Spatie\Permission\Models\Role;

class AssignAdminRole extends Command
{
    protected $signature = 'user:assign-admin-role {email=admin@ias.com}';
    protected $description = 'Assign admin role to a user';

    public function handle()
    {
        $email = $this->argument('email');

        $user = User::where('email', $email)->first();
        if (!$user) {
            $this->error("User with email {$email} not found.");
            return;
        }

        $role = Role::where('name', 'admin')->first();
        if (!$role) {
            $this->error("Admin role not found.");
            return;
        }

        if ($user->hasRole('admin')) {
            $this->info("User already has admin role.");
            return;
        }

        $user->assignRole($role);
        $this->info("Admin role assigned successfully to {$email}");
    }
}
