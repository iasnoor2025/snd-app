<?php

namespace Modules\EmployeeManagement\Console\Commands;

use Illuminate\Console\Command;
use Modules\ProjectManagement\Domain\Models\ProjectManpower;
use Modules\RentalManagement\Domain\Models\RentalOperatorAssignment;
use Modules\RentalManagement\Domain\Models\RentalItem;

class SyncEmployeeAssignments extends Command
{
    protected $signature = 'employee:sync-assignments';
    protected $description = 'Sync all project and rental assignments to the employee_assignments table.';

    public function handle()
    {
        $this->info('Syncing ProjectManpower assignments...');
        $count = 0;
        ProjectManpower::with(['project'])->chunk(100, function ($manpowers) use (&$count) {
            foreach ($manpowers as $manpower) {
                $manpower->touch(); // triggers observer
                $count++;
            }
        });
        $this->info("ProjectManpower assignments synced: $count");

        $this->info('Syncing RentalOperatorAssignment assignments...');
        $count = 0;
        RentalOperatorAssignment::with(['rental', 'rental.location'])->chunk(100, function ($assignments) use (&$count) {
            foreach ($assignments as $assignment) {
                $assignment->touch(); // triggers observer
                $count++;
            }
        });
        $this->info("RentalOperatorAssignment assignments synced: $count");

        $this->info('Syncing RentalItem operator assignments...');
        $count = 0;
        RentalItem::with(['rental', 'rental.location', 'operators'])->chunk(100, function ($items) use (&$count) {
            foreach ($items as $item) {
                $item->touch(); // triggers observer
                $count++;
            }
        });
        $this->info("RentalItem operator assignments synced: $count");

        $this->info('Employee assignments sync complete.');
        return 0;
    }
}
