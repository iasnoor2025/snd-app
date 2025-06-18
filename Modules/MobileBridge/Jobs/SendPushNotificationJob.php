<?php

namespace Modules\MobileBridge\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Modules\MobileBridge\Services\NotificationService;
use Exception;

class SendPushNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 300; // 5 minutes
    public $tries = 3;
    public $maxExceptions = 3;
    public $backoff = [60, 300, 900]; // 1 min, 5 min, 15 min

    private string $type;
    private array $recipients;
    private string $title;
    private string $body;
    private array $options;

    /**
     * Create a new job instance
     */
    public function __construct(
        string $type,
        array $recipients,
        string $title,
        string $body,
        array $options = []
    ) {
        $this->type = $type;
        $this->recipients = $recipients;
        $this->title = $title;
        $this->body = $body;
        $this->options = $options;

        // Set queue based on priority
        $priority = $options['priority'] ?? 'normal';
        $this->onQueue($this->getQueueName($priority));
    }

    /**
     * Execute the job
     */
    public function handle(NotificationService $notificationService): void
    {
        try {
            Log::info('Processing push notification job', [
                'type' => $this->type,
                'recipients_count' => count($this->recipients),
                'title' => $this->title,
                'priority' => $this->options['priority'] ?? 'normal'
            ]);

            $result = match($this->type) {
                'user' => $notificationService->sendToUser(
                    $this->recipients[0],
                    $this->title,
                    $this->body,
                    $this->options
                ),
                'users' => $notificationService->sendToUsers(
                    $this->recipients,
                    $this->title,
                    $this->body,
                    $this->options
                ),
                'role' => $notificationService->sendToRole(
                    $this->recipients[0],
                    $this->title,
                    $this->body,
                    $this->options
                ),
                'all' => $notificationService->sendToAll(
                    $this->title,
                    $this->body,
                    $this->options
                ),
                default => throw new Exception("Unknown notification type: {$this->type}")
            };

            Log::info('Push notification job completed successfully', [
                'type' => $this->type,
                'sent' => $result['sent'],
                'failed' => $result['failed'],
                'logs' => count($result['logs'])
            ]);

        } catch (Exception $e) {
            Log::error('Push notification job failed', [
                'type' => $this->type,
                'recipients' => $this->recipients,
                'title' => $this->title,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // Re-throw to trigger retry mechanism
            throw $e;
        }
    }

    /**
     * Handle job failure
     */
    public function failed(Exception $exception): void
    {
        Log::error('Push notification job failed permanently', [
            'type' => $this->type,
            'recipients' => $this->recipients,
            'title' => $this->title,
            'attempts' => $this->attempts(),
            'error' => $exception->getMessage()
        ]);

        // You could send an alert to administrators here
        // or create a failed notification log entry
    }

    /**
     * Get queue name based on priority
     */
    private function getQueueName(string $priority): string
    {
        return match($priority) {
            'urgent' => 'notifications-urgent',
            'high' => 'notifications-high',
            'normal' => 'notifications',
            'low' => 'notifications-low',
            default => 'notifications'
        };
    }

    /**
     * Get the tags that should be assigned to the job
     */
    public function tags(): array
    {
        return [
            'push-notification',
            "type:{$this->type}",
            "priority:{$this->options['priority'] ?? 'normal'}",
            "category:{$this->options['category'] ?? 'system'}"
        ];
    }

    /**
     * Calculate the number of seconds to wait before retrying the job
     */
    public function backoff(): array
    {
        return $this->backoff;
    }

    /**
     * Determine the time at which the job should timeout
     */
    public function retryUntil(): \DateTime
    {
        return now()->addHours(2); // Don't retry after 2 hours
    }

    /**
     * Get the middleware the job should pass through
     */
    public function middleware(): array
    {
        return [
            new \Illuminate\Queue\Middleware\RateLimited('push-notifications')
        ];
    }
}
