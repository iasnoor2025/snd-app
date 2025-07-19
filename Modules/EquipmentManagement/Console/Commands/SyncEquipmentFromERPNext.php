<?php

namespace Modules\EquipmentManagement\Console\Commands;

use Illuminate\Console\Command;
use Modules\EquipmentManagement\Actions\SyncEquipmentFromERPNextAction;
use Illuminate\Support\Facades\Log;

class SyncEquipmentFromERPNext extends Command
{
    protected $signature = 'erpnext:sync-equipment {--debug : Enable debug output}';
    protected $description = 'Sync all equipment from ERPNext and update local records.';

    public function handle()
    {
        $this->info('Starting ERPNext equipment sync...');

        try {
            $action = new SyncEquipmentFromERPNextAction();
            $count = $action->execute();

        $this->info("ERPNext Equipment Sync complete. {$count} equipment items processed.");

            if ($this->option('debug')) {
                $this->info('Check the logs for detailed information.');
            }

            return 0;

        } catch (\Exception $e) {
            $this->error('ERPNext Equipment Sync failed: ' . $e->getMessage());

            if ($this->option('debug')) {
                $this->error('Stack trace:');
                $this->error($e->getTraceAsString());
            }

            Log::error('ERPNext Equipment Sync Command Failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return 1;
        }
    }
}
