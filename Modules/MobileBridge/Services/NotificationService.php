<?php

namespace Modules\MobileBridge\Services;

use Modules\MobileBridge\Entities\PushSubscription;
use Modules\MobileBridge\Entities\NotificationLog;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Collection;
use App\Models\User;
use Carbon\Carbon;
use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;
use Exception;

class NotificationService
{
    private WebPush $webPush;
    private array $config;

    public function __construct()
    {
        $this->config = config('mobilebridge');
        $this->initializeWebPush();
    }

    /**
     * Initialize WebPush client
     */
    private function initializeWebPush(): void
    {
        $auth = [
            'VAPID' => [
                'subject' => $this->config['push_notifications']['vapid']['subject'],
                'publicKey' => $this->config['push_notifications']['vapid']['public_key'],
                'privateKey' => $this->config['push_notifications']['vapid']['private_key'],
            ],
        ];

        $this->webPush = new WebPush($auth);
        $this->webPush->setDefaultOptions([
            'TTL' => 300, // 5 minutes
            'urgency' => 'normal',
            'topic' => 'general'
        ]);
    }

    /**
     * Send notification to a specific user
     */
    public function sendToUser(
        int $userId,
        string $title,
        string $body,
        array $options = []
    ): array {
        $user = User::find($userId);
        if (!$user) {
            throw new Exception("User not found: {$userId}");
        }

        $subscriptions = PushSubscription::active()
            ->where('user_id', $userId)
            ->get();

        if ($subscriptions->isEmpty()) {
            Log::info("No active subscriptions found for user: {$userId}");
            return ['sent' => 0, 'failed' => 0, 'logs' => []];
        }

        return $this->sendToSubscriptions($subscriptions, $title, $body, $options);
    }

    /**
     * Send notification to multiple users
     */
    public function sendToUsers(
        array $userIds,
        string $title,
        string $body,
        array $options = []
    ): array {
        $subscriptions = PushSubscription::active()
            ->whereIn('user_id', $userIds)
            ->get();

        if ($subscriptions->isEmpty()) {
            Log::info("No active subscriptions found for users: " . implode(', ', $userIds));
            return ['sent' => 0, 'failed' => 0, 'logs' => []];
        }

        return $this->sendToSubscriptions($subscriptions, $title, $body, $options);
    }

    /**
     * Send notification to all users
     */
    public function sendToAll(
        string $title,
        string $body,
        array $options = []
    ): array {
        // For large-scale notifications, use chunking to avoid memory issues
        $results = ['sent' => 0, 'failed' => 0, 'logs' => []];

        PushSubscription::active()
            ->chunk(100, function ($subscriptions) use ($title, $body, $options, &$results) {
                $chunkResult = $this->sendToSubscriptions($subscriptions, $title, $body, $options);
                $results['sent'] += $chunkResult['sent'];
                $results['failed'] += $chunkResult['failed'];
                $results['logs'] = array_merge($results['logs'], $chunkResult['logs']);
            });

        return $results;
    }

    /**
     * Send notification to users with specific roles
     */
    public function sendToRole(
        string $role,
        string $title,
        string $body,
        array $options = []
    ): array {
        $userIds = User::role($role)->pluck('id')->toArray();

        if (empty($userIds)) {
            Log::info("No users found with role: {$role}");
            return ['sent' => 0, 'failed' => 0, 'logs' => []];
        }

        return $this->sendToUsers($userIds, $title, $body, $options);
    }

    /**
     * Send notification to subscriptions
     */
    private function sendToSubscriptions(
        Collection $subscriptions,
        string $title,
        string $body,
        array $options = []
    ): array {
        $results = ['sent' => 0, 'failed' => 0, 'logs' => []];
        $notifications = [];

        // Create notification logs first
        foreach ($subscriptions as $subscription) {
            $log = $this->createNotificationLog(
                $subscription->user_id,
                $subscription->id,
                $title,
                $body,
                $options
            );

            $results['logs'][] = $log->id;
            $notifications[] = [
                'subscription' => $subscription,
                'log' => $log,
                'payload' => $log->getPayload()
            ];
        }

        // Send notifications in batches
        $batches = array_chunk($notifications, 50);

        foreach ($batches as $batch) {
            $this->sendBatch($batch, $results);
        }

        Log::info('Notification batch completed', [
            'total_subscriptions' => $subscriptions->count(),
            'sent' => $results['sent'],
            'failed' => $results['failed']
        ]);

        return $results;
    }

    /**
     * Send a batch of notifications
     */
    private function sendBatch(array $batch, array &$results): void
    {
        foreach ($batch as $notification) {
            try {
                $subscription = $notification['subscription'];
                $log = $notification['log'];
                $payload = $notification['payload'];

                // Create WebPush subscription
                $webPushSubscription = Subscription::create([
                    'endpoint' => $subscription->endpoint,
                    'publicKey' => $subscription->p256dh_key,
                    'authToken' => $subscription->auth_key,
                ]);

                // Queue the notification
                $this->webPush->queueNotification(
                    $webPushSubscription,
                    json_encode($payload),
                    [
                        'TTL' => $this->getTTL($log->priority),
                        'urgency' => $this->getUrgency($log->priority),
                        'topic' => $log->category
                    ]
                );

                $log->markAsSent();
                $results['sent']++;

            } catch (Exception $e) {
                $log->markAsFailed($e->getMessage());
                $results['failed']++;

                Log::error('Failed to queue notification', [
                    'subscription_id' => $subscription->id,
                    'user_id' => $subscription->user_id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        // Flush the queue to actually send notifications
        $this->flushNotifications($results);
    }

    /**
     * Flush queued notifications
     */
    private function flushNotifications(array &$results): void
    {
        try {
            foreach ($this->webPush->flush() as $report) {
                $endpoint = $report->getRequest()->getUri()->__toString();

                // Find the subscription by endpoint
                $subscription = PushSubscription::where('endpoint', $endpoint)->first();

                if (!$subscription) {
                    continue;
                }

                // Find the most recent notification log for this subscription
                $log = NotificationLog::where('push_subscription_id', $subscription->id)
                    ->where('status', NotificationLog::STATUS_SENT)
                    ->orderBy('created_at', 'desc')
                    ->first();

                if (!$log) {
                    continue;
                }

                if ($report->isSuccess()) {
                    $log->markAsDelivered();
                    $subscription->recordSuccess();
                } else {
                    $errorMessage = $report->getReason();
                    $log->markAsFailed($errorMessage);
                    $subscription->recordFailure($errorMessage);

                    // Handle specific error cases
                    if ($report->isSubscriptionExpired()) {
                        $subscription->markAsExpired();
                        Log::info('Subscription expired and marked inactive', [
                            'subscription_id' => $subscription->id,
                            'user_id' => $subscription->user_id
                        ]);
                    }

                    $results['failed']++;
                    $results['sent']--; // Adjust count since it actually failed
                }
            }
        } catch (Exception $e) {
            Log::error('Error flushing notifications', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    /**
     * Create notification log entry
     */
    private function createNotificationLog(
        int $userId,
        int $subscriptionId,
        string $title,
        string $body,
        array $options
    ): NotificationLog {
        return NotificationLog::create([
            'user_id' => $userId,
            'push_subscription_id' => $subscriptionId,
            'title' => $title,
            'body' => $body,
            'icon' => $options['icon'] ?? '/icons/icon-192x192.png',
            'image' => $options['image'] ?? null,
            'url' => $options['url'] ?? null,
            'tag' => $options['tag'] ?? null,
            'data' => $options['data'] ?? [],
            'priority' => $options['priority'] ?? NotificationLog::PRIORITY_NORMAL,
            'category' => $options['category'] ?? NotificationLog::CATEGORY_SYSTEM,
            'metadata' => $options['metadata'] ?? []
        ]);
    }

    /**
     * Get TTL based on priority
     */
    private function getTTL(string $priority): int
    {
        return match($priority) {
            NotificationLog::PRIORITY_URGENT => 3600, // 1 hour
            NotificationLog::PRIORITY_HIGH => 1800,   // 30 minutes
            NotificationLog::PRIORITY_NORMAL => 300,  // 5 minutes
            NotificationLog::PRIORITY_LOW => 60,      // 1 minute
            default => 300
        };
    }

    /**
     * Get urgency based on priority
     */
    private function getUrgency(string $priority): string
    {
        return match($priority) {
            NotificationLog::PRIORITY_URGENT => 'high',
            NotificationLog::PRIORITY_HIGH => 'high',
            NotificationLog::PRIORITY_NORMAL => 'normal',
            NotificationLog::PRIORITY_LOW => 'low',
            default => 'normal'
        };
    }

    /**
     * Retry failed notifications
     */
    public function retryFailedNotifications(int $maxRetries = 3): array
    {
        $failedLogs = NotificationLog::needsRetry($maxRetries)->get();

        if ($failedLogs->isEmpty()) {
            return ['retried' => 0, 'failed' => 0];
        }

        $results = ['retried' => 0, 'failed' => 0];

        foreach ($failedLogs as $log) {
            try {
                $subscription = $log->pushSubscription;

                if (!$subscription || !$subscription->is_active) {
                    $log->markAsFailed('Subscription no longer active');
                    $results['failed']++;
                    continue;
                }

                // Increment retry count
                $log->incrementRetry();

                // Reset status to pending for retry
                $log->update(['status' => NotificationLog::STATUS_PENDING]);

                // Resend the notification
                $this->sendToSubscriptions(
                    collect([$subscription]),
                    $log->title,
                    $log->body,
                    [
                        'icon' => $log->icon,
                        'image' => $log->image,
                        'url' => $log->url,
                        'tag' => $log->tag,
                        'data' => $log->data,
                        'priority' => $log->priority,
                        'category' => $log->category,
                        'metadata' => $log->metadata
                    ]
                );

                $results['retried']++;

            } catch (Exception $e) {
                $log->markAsFailed('Retry failed: ' . $e->getMessage());
                $results['failed']++;

                Log::error('Failed to retry notification', [
                    'log_id' => $log->id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        Log::info('Notification retry completed', $results);

        return $results;
    }

    /**
     * Send test notification
     */
    public function sendTestNotification(int $userId): array
    {
        return $this->sendToUser(
            $userId,
            'Test Notification',
            'This is a test notification to verify your push notification setup.',
            [
                'icon' => '/icons/test.png',
                'tag' => 'test',
                'category' => NotificationLog::CATEGORY_SYSTEM,
                'priority' => NotificationLog::PRIORITY_NORMAL,
                'data' => [
                    'test' => true,
                    'timestamp' => now()->timestamp
                ]
            ]
        );
    }

    /**
     * Get notification statistics
     */
    public function getStatistics(int $days = 30): array
    {
        $startDate = Carbon::now()->subDays($days);

        $total = NotificationLog::where('created_at', '>=', $startDate)->count();
        $sent = NotificationLog::where('created_at', '>=', $startDate)
            ->where('status', '!=', NotificationLog::STATUS_PENDING)
            ->count();
        $delivered = NotificationLog::where('created_at', '>=', $startDate)
            ->where('status', NotificationLog::STATUS_DELIVERED)
            ->count();
        $failed = NotificationLog::where('created_at', '>=', $startDate)
            ->where('status', NotificationLog::STATUS_FAILED)
            ->count();
        $clicked = NotificationLog::where('created_at', '>=', $startDate)
            ->whereNotNull('clicked_at')
            ->count();

        return [
            'period_days' => $days,
            'total_notifications' => $total,
            'sent' => $sent,
            'delivered' => $delivered,
            'failed' => $failed,
            'clicked' => $clicked,
            'delivery_rate' => $sent > 0 ? round(($delivered / $sent) * 100, 2) : 0,
            'click_rate' => $delivered > 0 ? round(($clicked / $delivered) * 100, 2) : 0,
            'failure_rate' => $sent > 0 ? round(($failed / $sent) * 100, 2) : 0,
            'category_stats' => NotificationLog::getStatsByCategory($days),
            'daily_stats' => $this->getDailyStats($days)
        ];
    }

    /**
     * Get daily notification statistics
     */
    private function getDailyStats(int $days): array
    {
        $stats = [];

        for ($i = $days - 1; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $dayStart = $date->copy()->startOfDay();
            $dayEnd = $date->copy()->endOfDay();

            $dayStats = NotificationLog::whereBetween('created_at', [$dayStart, $dayEnd])
                ->selectRaw('
                    COUNT(*) as total,
                    SUM(CASE WHEN status = "delivered" THEN 1 ELSE 0 END) as delivered,
                    SUM(CASE WHEN status = "failed" THEN 1 ELSE 0 END) as failed,
                    SUM(CASE WHEN clicked_at IS NOT NULL THEN 1 ELSE 0 END) as clicked
                ')
                ->first();

            $stats[] = [
                'date' => $date->format('Y-m-d'),
                'total' => $dayStats->total ?? 0,
                'delivered' => $dayStats->delivered ?? 0,
                'failed' => $dayStats->failed ?? 0,
                'clicked' => $dayStats->clicked ?? 0
            ];
        }

        return $stats;
    }

    /**
     * Clean up old notification data
     */
    public function cleanup(int $daysToKeep = 90): array
    {
        $deletedLogs = NotificationLog::cleanup($daysToKeep);
        $deletedSubscriptions = PushSubscription::cleanup();

        return [
            'deleted_logs' => $deletedLogs,
            'deleted_subscriptions' => $deletedSubscriptions
        ];
    }
}
