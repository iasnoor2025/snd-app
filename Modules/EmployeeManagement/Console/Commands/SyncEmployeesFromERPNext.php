<?php

namespace Modules\EmployeeManagement\Console\Commands;

use Illuminate\Console\Command;
use Modules\EmployeeManagement\Actions\SyncEmployeesFromERPNextAction;

class SyncEmployeesFromERPNext extends Command
{
    protected $signature = 'erpnext:sync-employees';
    protected $description = 'Sync all employees from ERPNext and update local records.';

    public function handle()
    {
        $count = (new SyncEmployeesFromERPNextAction())->execute();
        $this->info("ERPNext Employee Sync complete. {$count} employees processed.");
    }
}
