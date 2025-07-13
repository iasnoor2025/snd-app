<?php

namespace Modules\EmployeeManagement\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Modules\EmployeeManagement\Actions\SyncEmployeesFromERPNextAction;

class SyncEmployeesFromERPNextJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle()
    {
        Log::info('SyncEmployeesFromERPNextJob started');
        try {
            $count = (new SyncEmployeesFromERPNextAction())->execute();
            Log::info("SyncEmployeesFromERPNextJob completed: {$count} employees processed.");
        } catch (\Throwable $e) {
            Log::error('SyncEmployeesFromERPNextJob failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }
}
