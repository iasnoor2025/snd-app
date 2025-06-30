<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Modules\Core\Domain\Models\User;
use Modules\PayrollManagement\Domain\Models\Payroll;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

class TestPayrollAuth extends Command
{
    protected $signature = 'test:payroll-auth {user_id=1}';
    protected $description = 'Test the exact authorization that PayrollController uses';

    public function handle()
    {
        $userId = $this->argument('user_id');
        $user = User::find($userId);

        if (!$user) {
            $this->error("User with ID {$userId} not found");
            return;
        }

        $this->info("Testing authorization for user: {$user->email}");

        // Set the authenticated user (simulate login)
        Auth::login($user);

        try {
            // This is what the controller actually does: $this->authorize('viewAny', Payroll::class)
            // Which internally uses Gate::authorize()
            Gate::authorize('viewAny', Payroll::class);
            $this->info("Gate::authorize('viewAny', Payroll::class): SUCCESS");
        } catch (\Exception $e) {
            $this->error("Gate::authorize('viewAny', Payroll::class): FAILED - " . $e->getMessage());
        }

        // Also test Gate::allows for comparison
        try {
            $allows = Gate::allows('viewAny', Payroll::class);
            $this->info("Gate::allows('viewAny', Payroll::class): " . ($allows ? 'TRUE' : 'FALSE'));
        } catch (\Exception $e) {
            $this->error("Gate::allows test failed: " . $e->getMessage());
        }

        return 0;
    }
}
