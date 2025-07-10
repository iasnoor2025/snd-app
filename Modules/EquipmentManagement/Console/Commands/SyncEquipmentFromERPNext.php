<?php

namespace Modules\EquipmentManagement\Console\Commands;

use Illuminate\Console\Command;
use Modules\EquipmentManagement\Actions\SyncEquipmentFromERPNextAction;

class SyncEquipmentFromERPNext extends Command
{
    protected $signature = 'erpnext:sync-equipment';
    protected $description = 'Sync all equipment from ERPNext and update local records.';

    public function handle()
    {
        $count = (new SyncEquipmentFromERPNextAction())->execute();
        $this->info("ERPNext Equipment Sync complete. {$count} equipment items processed.");
    }
}
