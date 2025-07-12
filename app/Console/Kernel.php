<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * The Artisan commands provided by your application.
     *
     * @var array
     */
    protected $commands = [
        Commands\CreateAdminUser::class,
        Commands\AssignAllPermissionsToAdmin::class,
        Commands\VerifyAdminUser::class,
        Commands\CreateTestTimesheet::class,
        Commands\TestTimesheetApproval::class,
        Commands\TestTimesheetWorkflow::class,
        Commands\TestTimesheetRoutes::class,
        Commands\TestAllModuleRoutes::class,
        Commands\PublishModuleTranslations::class,
        Commands\SyncERPNextInvoiceStatus::class, // Register the sync command
    ];

    /**
     * Define the application's command schedule.
     *
     * These schedules are used to run commands at specific times or intervals.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        // $schedule->command('inspire:inspire')->hourly();
        $schedule->command('erpnext:sync-invoice-status')->everyFiveMinutes();
        $schedule->command('timesheets:auto-generate')->dailyAt('04:10');
        $schedule->call(function () {
            \Modules\SafetyManagement\Services\SafetyReminderService::dispatchReminders();
        })->dailyAt('03:00');
    }

    /**
     * Register the commands for the application.
     *
     * @return void
     */
    protected function commands()
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
