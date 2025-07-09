<?php

namespace Modules\CustomerManagement\Console;

use Illuminate\Console\Command;
use Modules\CustomerManagement\Actions\SyncCustomersFromERPNextAction;

class SyncCustomersFromERPNext extends Command
{
    protected $signature = 'erpnext:sync-customers';
    protected $description = 'Sync all customers from ERPNext and update local records.';

    public function handle()
    {
        $count = (new SyncCustomersFromERPNextAction())->execute();
        $this->info("ERPNext Customer Sync complete. {$count} customers processed.");
    }
}
