<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Modules\Core\Domain\Models\User;

class TestSimplePayroll extends Command
{
    protected $signature = 'test:simple-payroll {user_id=1}';
    protected $description = 'Simple test for payroll access';

    public function handle()
    {
        $userId = $this->argument('user_id');
        $user = User::find($userId);

        if (!$user) {
            $this->error("User with ID {$userId} not found");
            return;
        }

        $this->info("User: {$user->email}");

        // Test hasPermissionTo method
        try {
            $hasPermission = $user->hasPermissionTo('payroll.view');
            $this->info("hasPermissionTo('payroll.view'): " . ($hasPermission ? 'YES' : 'NO'));
        } catch (\Exception $e) {
            $this->error("Error testing hasPermissionTo: " . $e->getMessage());
        }

        // Test can method
        try {
            $canView = $user->can('payroll.view');
            $this->info("can('payroll.view'): " . ($canView ? 'YES' : 'NO'));
        } catch (\Exception $e) {
            $this->error("Error testing can: " . $e->getMessage());
        }

        return 0;
    }
}
