<?php

namespace Modules\Notifications\Console\Commands;

use Illuminate\Console\Command;
use Modules\Notifications\Services\ScheduledNotificationService;

class ProcessScheduledNotifications extends Command
{
    protected $signature = 'notifications:process-scheduled';
    protected $description = 'Process and send due scheduled notifications';

    public function handle(ScheduledNotificationService $service)
    {
        $service->processDue();
        $this->info('Processed scheduled notifications.');
    }
}
