<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Modules\Core\Domain\Models\User;


class VerifyAdminUser extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:verify-admin {email=admin@ias.com}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Verify admin user permissions and role';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');

        $user = User::where('email', $email)->first();

        if (!$user) {
            $this->error("User with email {$email} not found.");
            return;
        }

        $this->info("User found: {$user->email}");
        $this->info("Name: {$user->name}");

        $roles = $user->roles->pluck('name')->toArray();
        $this->info("Roles: " . (empty($roles) ? 'None' : implode(', ', $roles)));

        $this->info("Has admin role: " . ($user->hasRole('admin') ? 'Yes' : 'No'));

        // Check specific timesheet permissions
        $timesheetPermissions = [
            'timesheets.view',
            'timesheets.create',
            'timesheets.edit',
            'timesheets.delete'
        ];

        $this->info("\nTimesheet Permissions:");
        foreach ($timesheetPermissions as $permission) {
            $hasPermission = $user->can($permission) ? 'Yes' : 'No';
            $this->info("  {$permission}: {$hasPermission}");
        }

        // Show total permission count
        $totalPermissions = $user->getAllPermissions()->count();
        $this->info("\nTotal permissions: {$totalPermissions}");
    }
}
