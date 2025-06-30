<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Modules\Core\Domain\Models\User;

class CheckUserPermissions extends Command
{
    protected $signature = 'user:check-permissions {user_id=1}';
    protected $description = 'Check permissions for a user';

    public function handle()
    {
        $userId = $this->argument('user_id');
        $user = User::find($userId);

        if (!$user) {
            $this->error("User with ID {$userId} not found");
            return;
        }

        $this->info("User: {$user->email}");
        $this->info("Roles: " . $user->roles->pluck('name')->join(', '));

        $payrollPermissions = $user->getAllPermissions()->filter(function($perm) {
            return str_contains($perm->name, 'payroll');
        });

        $this->info("Payroll permissions: " . $payrollPermissions->pluck('name')->join(', '));

        $hasPayrollView = $user->can('payroll.view');
        $this->info("Can view payroll: " . ($hasPayrollView ? 'YES' : 'NO'));

        return 0;
    }
}
