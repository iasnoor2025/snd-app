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