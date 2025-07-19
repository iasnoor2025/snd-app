<?php

namespace Modules\EquipmentManagement\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Modules\EquipmentManagement\Actions\SyncEquipmentFromERPNextAction;

class SyncEquipmentFromERPNextJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 300; // 5 minutes timeout
    public $tries = 3; // Retry up to 3 times

    public function handle()
    {
        Log::info('SyncEquipmentFromERPNextJob started');
        try {
            $count = (new SyncEquipmentFromERPNextAction())->execute();
            Log::info("SyncEquipmentFromERPNextJob completed: {$count} equipment items processed.");
        } catch (\Throwable $e) {
            Log::error('SyncEquipmentFromERPNextJob failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e; // Re-throw to trigger retry
        }
    }
}
