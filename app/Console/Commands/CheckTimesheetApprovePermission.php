<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Modules\Core\Domain\Models\User;

class CheckTimesheetApprovePermission extends Command
{
    protected $signature = 'user:check-timesheet-approve {email=admin@ias.com}';
    protected $description = 'Check if user has timesheets.approve permission';

    public function handle()
    {
        $email = $this->argument('email');

        $user = User::where('email', $email)->first();
        if (!$user) {
            $this->error("User with email {$email} not found.");
            return;
        }

        $hasPermission = $user->can('timesheets.approve');
        $this->info("User: {$email}");
        $this->info("Has timesheets.approve permission: " . ($hasPermission ? 'Yes' : 'No'));

        if (!$hasPermission) {
            $this->warn("User does not have the timesheets.approve permission needed for approval.");
        }
    }
}
