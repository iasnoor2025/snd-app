<?php

namespace Modules\MobileBridge\Console\Commands;

use Illuminate\Console\Command;
use Modules\MobileBridge\Services\NotificationService;
use Modules\MobileBridge\Entities\NotificationLog;
use Modules\MobileBridge\Entities\PushSubscription;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class NotificationMaintenanceCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'mobilebridge:notification-maintenance
                           {--retry : Retry failed notifications}
                           {--cleanup : Clean up old notification data}
                           {--stats : Show notification statistics}
                           {--test-user= : Send test notification to specific user ID}
                           {--max-retries=3 : Maximum retry attempts for failed notifications}
                           {--cleanup-days=90 : Days to keep notification data}
                           {--stats-days=30 : Days for statistics calculation}';

    /**
     * The console command description.
     */
    protected $description = 'Perform maintenance tasks for push notifications';

    private NotificationService $notificationService;

    /**
     * Create a new command instance.
     */
    public function __construct(NotificationService $notificationService)
    {
        parent::__construct();
        $this->notificationService = $notificationService;
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Starting notification maintenance...');

        try {
            // Handle test notification
            if ($userId = $this->option('test-user')) {
                return $this->sendTestNotification((int) $userId);
            }

            // Handle retry option
            if ($this->option('retry')) {
                $this->retryFailedNotifications();
            }

            // Handle cleanup option
            if ($this->option('cleanup')) {
                $this->cleanupOldData();
            }

            // Handle stats option
            if ($this->option('stats')) {
                $this->showStatistics();
            }

            // If no specific options, run all maintenance tasks
            if (!$this->option('retry') && !$this->option('cleanup') && !$this->option('stats')) {
                $this->info('Running all maintenance tasks...');
                $this->retryFailedNotifications();
                $this->cleanupOldData();
                $this->showStatistics();
            }

            $this->info('Notification maintenance completed successfully.');
            return Command::SUCCESS;

        } catch (\Exception $e) {
            $this->error('Notification maintenance failed: ' . $e->getMessage());
            Log::error('Notification maintenance command failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return Command::FAILURE;
        }
    }

    /**
     * Retry failed notifications
     */
    private function retryFailedNotifications(): void
    {
        $this->info('Retrying failed notifications...');

        $maxRetries = (int) $this->option('max-retries');
        $failedCount = NotificationLog::needsRetry($maxRetries)->count();

        if ($failedCount === 0) {
            $this->info('No failed notifications to retry.');
            return;
        }

        $this->info("Found {$failedCount} failed notifications to retry.");

        $progressBar = $this->output->createProgressBar($failedCount);
        $progressBar->start();

        $results = $this->notificationService->retryFailedNotifications($maxRetries);

        $progressBar->finish();
        $this->newLine();

        $this->table(
            ['Metric', 'Count'],
            [
                ['Retried Successfully', $results['retried']],
                ['Failed Again', $results['failed']],
                ['Total Processed', $results['retried'] + $results['failed']]
            ]
        );

        Log::info('Notification retry completed', $results);
    }

    /**
     * Clean up old notification data
     */
    private function cleanupOldData(): void
    {
        $this->info('Cleaning up old notification data...');

        $cleanupDays = (int) $this->option('cleanup-days');

        // Show what will be cleaned up
        $cutoffDate = Carbon::now()->subDays($cleanupDays);
        $logsToDelete = NotificationLog::where('created_at', '<', $cutoffDate)
            ->where('status', '!=', NotificationLog::STATUS_PENDING)
            ->count();

        $subscriptionsToDelete = PushSubscription::where('is_active', false)
            ->where('updated_at', '<', Carbon::now()->subDays(30))
            ->count();

        if ($logsToDelete === 0 && $subscriptionsToDelete === 0) {
            $this->info('No old data to clean up.');
            return;
        }

        $this->warn("This will delete:");
        $this->warn("- {$logsToDelete} notification logs older than {$cleanupDays} days");
        $this->warn("- {$subscriptionsToDelete} inactive push subscriptions older than 30 days");

        if (!$this->confirm('Do you want to continue?')) {
            $this->info('Cleanup cancelled.');
            return;
        }

        $results = $this->notificationService->cleanup($cleanupDays);

        $this->table(
            ['Data Type', 'Deleted Count'],
            [
                ['Notification Logs', $results['deleted_logs']],
                ['Push Subscriptions', $results['deleted_subscriptions']]
            ]
        );

        Log::info('Notification cleanup completed', $results);
    }

    /**
     * Show notification statistics
     */
    private function showStatistics(): void
    {
        $this->info('Generating notification statistics...');

        $statsDays = (int) $this->option('stats-days');
        $stats = $this->notificationService->getStatistics($statsDays);

        $this->info("\nNotification Statistics (Last {$statsDays} days):");

        // Overall stats
        $this->table(
            ['Metric', 'Value'],
            [
                ['Total Notifications', number_format($stats['total_notifications'])],
                ['Sent', number_format($stats['sent'])],
                ['Delivered', number_format($stats['delivered'])],
                ['Failed', number_format($stats['failed'])],
                ['Clicked', number_format($stats['clicked'])],
                ['Delivery Rate', $stats['delivery_rate'] . '%'],
                ['Click Rate', $stats['click_rate'] . '%'],
                ['Failure Rate', $stats['failure_rate'] . '%']
            ]
        );

        // Category stats
        if (!empty($stats['category_stats'])) {
            $this->info('\nStats by Category:');
            $categoryData = [];
            foreach ($stats['category_stats'] as $category => $categoryStats) {
                $categoryData[] = [
                    ucfirst($category),
                    number_format($categoryStats['total']),
                    number_format($categoryStats['delivered']),
                    number_format($categoryStats['clicked']),
                    $categoryStats['click_rate'] . '%'
                ];
            }

            $this->table(
                ['Category', 'Total', 'Delivered', 'Clicked', 'Click Rate'],
                $categoryData
            );
        }

        // Current system status
        $this->info('\nCurrent System Status:');
        $activeSubscriptions = PushSubscription::active()->count();
        $totalUsers = PushSubscription::distinct('user_id')->count();
        $pendingNotifications = NotificationLog::where('status', NotificationLog::STATUS_PENDING)->count();

        $this->table(
            ['Metric', 'Value'],
            [
                ['Active Subscriptions', number_format($activeSubscriptions)],
                ['Users with Subscriptions', number_format($totalUsers)],
                ['Pending Notifications', number_format($pendingNotifications)]
            ]
        );

        // Recent daily stats (last 7 days)
        if (!empty($stats['daily_stats'])) {
            $this->info('\nDaily Stats (Last 7 days):');
            $dailyData = [];
            $recentStats = array_slice($stats['daily_stats'], -7);

            foreach ($recentStats as $day) {
                $dailyData[] = [
                    $day['date'],
                    number_format($day['total']),
                    number_format($day['delivered']),
                    number_format($day['failed']),
                    number_format($day['clicked'])
                ];
            }

            $this->table(
                ['Date', 'Total', 'Delivered', 'Failed', 'Clicked'],
                $dailyData
            );
        }
    }

    /**
     * Send test notification to a specific user
     */
    private function sendTestNotification(int $userId): int
    {
        $this->info("Sending test notification to user ID: {$userId}");

        try {
            $result = $this->notificationService->sendTestNotification($userId);

            if ($result['sent'] > 0) {
                $this->info("✅ Test notification sent successfully!");
                $this->info("Sent: {$result['sent']}, Failed: {$result['failed']}");

                if (!empty($result['logs'])) {
                    $this->info("Notification log IDs: " . implode(', ', $result['logs']));
                }
            } else {
                $this->warn("⚠️  No notifications were sent. User may not have active subscriptions.");
            }

            return Command::SUCCESS;

        } catch (\Exception $e) {
            $this->error("❌ Failed to send test notification: " . $e->getMessage());
            return Command::FAILURE;
        }
    }

    /**
     * Get the console command arguments.
     */
    protected function getArguments(): array
    {
        return [];
    }

    /**
     * Get the console command options.
     */
    protected function getOptions(): array
    {
        return [
            ['retry', 'r', null, 'Retry failed notifications'],
            ['cleanup', 'c', null, 'Clean up old notification data'],
            ['stats', 's', null, 'Show notification statistics'],
            ['test-user', 't', \Symfony\Component\Console\Input\InputOption::VALUE_REQUIRED, 'Send test notification to specific user ID'],
            ['max-retries', null, \Symfony\Component\Console\Input\InputOption::VALUE_REQUIRED, 'Maximum retry attempts for failed notifications', 3],
            ['cleanup-days', null, \Symfony\Component\Console\Input\InputOption::VALUE_REQUIRED, 'Days to keep notification data', 90],
            ['stats-days', null, \Symfony\Component\Console\Input\InputOption::VALUE_REQUIRED, 'Days for statistics calculation', 30]
        ];
    }
}
