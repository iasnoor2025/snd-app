<?php

namespace Modules\MobileBridge\Entities;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\Core\Domain\Models\User;
use Carbon\Carbon;

class NotificationLog extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'notification_logs';

    protected $fillable = [
        'user_id',
        'push_subscription_id',
        'title',
        'body',
        'icon',
        'image',
        'url',
        'tag',
        'data',
        'status',
        'sent_at',
        'delivered_at',
        'clicked_at',
        'dismissed_at',
        'viewed_at',
        'error_message',
        'retry_count',
        'priority',
        'category',
        'metadata'
    ];

    protected $casts = [
        'data' => 'array',
        'metadata' => 'array',
        'sent_at' => 'datetime',
        'delivered_at' => 'datetime',
        'clicked_at' => 'datetime',
        'dismissed_at' => 'datetime',
        'viewed_at' => 'datetime',
        'retry_count' => 'integer'
    ];

    protected $dates = [
        'sent_at',
        'delivered_at',
        'clicked_at',
        'dismissed_at',
        'viewed_at',
        'deleted_at'
    ];

    // Status constants
    const STATUS_PENDING = 'pending';
    const STATUS_SENT = 'sent';
    const STATUS_DELIVERED = 'delivered';
    const STATUS_FAILED = 'failed';
    const STATUS_EXPIRED = 'expired';

    // Priority constants
    const PRIORITY_LOW = 'low';
    const PRIORITY_NORMAL = 'normal';
    const PRIORITY_HIGH = 'high';
    const PRIORITY_URGENT = 'urgent';

    // Category constants
    const CATEGORY_SYSTEM = 'system';
    const CATEGORY_MARKETING = 'marketing';
    const CATEGORY_TRANSACTIONAL = 'transactional';
    const CATEGORY_REMINDER = 'reminder';
    const CATEGORY_ALERT = 'alert';

    /**
     * Get the user that owns the notification log
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the push subscription associated with this log
     */
    public function pushSubscription(): BelongsTo
    {
        return $this->belongsTo(PushSubscription::class);
    }

    /**
     * Scope to get notifications by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope to get notifications by priority
     */
    public function scopeByPriority($query, $priority)
    {
        return $query->where('priority', $priority);
    }

    /**
     * Scope to get notifications by category
     */
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Scope to get notifications for a specific user
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope to get recent notifications
     */
    public function scopeRecent($query, $days = 7)
    {
        return $query->where('created_at', '>=', Carbon::now()->subDays($days));
    }

    /**
     * Scope to get clicked notifications
     */
    public function scopeClicked($query)
    {
        return $query->whereNotNull('clicked_at');
    }

    /**
     * Scope to get dismissed notifications
     */
    public function scopeDismissed($query)
    {
        return $query->whereNotNull('dismissed_at');
    }

    /**
     * Scope to get delivered notifications
     */
    public function scopeDelivered($query)
    {
        return $query->where('status', self::STATUS_DELIVERED);
    }

    /**
     * Scope to get failed notifications
     */
    public function scopeFailed($query)
    {
        return $query->where('status', self::STATUS_FAILED);
    }

    /**
     * Scope to get notifications that need retry
     */
    public function scopeNeedsRetry($query, $maxRetries = 3)
    {
        return $query->where('status', self::STATUS_FAILED)
                    ->where('retry_count', '<', $maxRetries)
                    ->where('created_at', '>=', Carbon::now()->subHours(24)); // Only retry within 24 hours
    }

    /**
     * Mark notification as sent
     */
    public function markAsSent(): void
    {
        $this->update([
            'status' => self::STATUS_SENT,
            'sent_at' => now()
        ]);
    }

    /**
     * Mark notification as delivered
     */
    public function markAsDelivered(): void
    {
        $this->update([
            'status' => self::STATUS_DELIVERED,
            'delivered_at' => now()
        ]);
    }

    /**
     * Mark notification as failed
     */
    public function markAsFailed(string $errorMessage = null): void
    {
        $this->update([
            'status' => self::STATUS_FAILED,
            'error_message' => $errorMessage
        ]);
    }

    /**
     * Mark notification as clicked
     */
    public function markAsClicked(): void
    {
        $this->update([
            'clicked_at' => now()
        ]);
    }

    /**
     * Mark notification as dismissed
     */
    public function markAsDismissed(): void
    {
        $this->update([
            'dismissed_at' => now()
        ]);
    }

    /**
     * Mark notification as viewed
     */
    public function markAsViewed(): void
    {
        $this->update([
            'viewed_at' => now()
        ]);
    }

    /**
     * Increment retry count
     */
    public function incrementRetry(): void
    {
        $this->increment('retry_count');
    }

    /**
     * Check if notification was interacted with
     */
    public function wasInteractedWith(): bool
    {
        return $this->clicked_at !== null || $this->dismissed_at !== null;
    }

    /**
     * Check if notification was successful
     */
    public function wasSuccessful(): bool
    {
        return in_array($this->status, [self::STATUS_SENT, self::STATUS_DELIVERED]);
    }

    /**
     * Check if notification can be retried
     */
    public function canRetry(int $maxRetries = 3): bool
    {
        return $this->status === self::STATUS_FAILED &&
               $this->retry_count < $maxRetries &&
               $this->created_at >= Carbon::now()->subHours(24);
    }

    /**
     * Get notification payload for sending
     */
    public function getPayload(): array
    {
        return [
            'title' => $this->title,
            'body' => $this->body,
            'icon' => $this->icon,
            'image' => $this->image,
            'badge' => '/icons/badge-72x72.png',
            'tag' => $this->tag,
            'data' => array_merge($this->data ?? [], [
                'url' => $this->url,
                'notification_id' => $this->id,
                'timestamp' => $this->created_at->timestamp
            ]),
            'actions' => $this->getActions(),
            'requireInteraction' => $this->priority === self::PRIORITY_URGENT,
            'silent' => false
        ];
    }

    /**
     * Get notification actions based on category
     */
    private function getActions(): array
    {
        $actions = [];

        // Add view action if URL is provided
        if ($this->url) {
            $actions[] = [
                'action' => 'view',
                'title' => 'View',
                'icon' => '/icons/view.png'
            ];
        }

        // Add category-specific actions
        switch ($this->category) {
            case self::CATEGORY_REMINDER:
                $actions[] = [
                    'action' => 'snooze',
                    'title' => 'Snooze',
                    'icon' => '/icons/snooze.png'
                ];
                break;

            case self::CATEGORY_ALERT:
                $actions[] = [
                    'action' => 'acknowledge',
                    'title' => 'Acknowledge',
                    'icon' => '/icons/check.png'
                ];
                break;
        }

        // Always add dismiss action
        $actions[] = [
            'action' => 'dismiss',
            'title' => 'Dismiss'
        ];

        return array_slice($actions, 0, 2); // Max 2 actions for better UX
    }

    /**
     * Get delivery time in seconds
     */
    public function getDeliveryTime(): ?int
    {
        if ($this->sent_at && $this->delivered_at) {
            return $this->delivered_at->diffInSeconds($this->sent_at);
        }
        return null;
    }

    /**
     * Get time to interaction in seconds
     */
    public function getTimeToInteraction(): ?int
    {
        $interactionTime = $this->clicked_at ?? $this->dismissed_at;
        if ($this->delivered_at && $interactionTime) {
            return $interactionTime->diffInSeconds($this->delivered_at);
        }
        return null;
    }

    /**
     * Get notification statistics for a user
     */
    public static function getStatsForUser(int $userId, int $days = 30): array
    {
        $query = self::forUser($userId)->where('created_at', '>=', Carbon::now()->subDays($days));

        $total = $query->count();
        $sent = $query->where('status', '!=', self::STATUS_PENDING)->count();
        $delivered = $query->where('status', self::STATUS_DELIVERED)->count();
        $failed = $query->where('status', self::STATUS_FAILED)->count();
        $clicked = $query->whereNotNull('clicked_at')->count();
        $dismissed = $query->whereNotNull('dismissed_at')->count();

        return [
            'total' => $total,
            'sent' => $sent,
            'delivered' => $delivered,
            'failed' => $failed,
            'clicked' => $clicked,
            'dismissed' => $dismissed,
            'delivery_rate' => $sent > 0 ? round(($delivered / $sent) * 100, 2) : 0,
            'click_rate' => $delivered > 0 ? round(($clicked / $delivered) * 100, 2) : 0,
            'engagement_rate' => $delivered > 0 ? round((($clicked + $dismissed) / $delivered) * 100, 2) : 0
        ];
    }

    /**
     * Get notification statistics by category
     */
    public static function getStatsByCategory(int $days = 30): array
    {
        $categories = [self::CATEGORY_SYSTEM, self::CATEGORY_MARKETING, self::CATEGORY_TRANSACTIONAL, self::CATEGORY_REMINDER, self::CATEGORY_ALERT];
        $stats = [];

        foreach ($categories as $category) {
            $query = self::byCategory($category)->where('created_at', '>=', Carbon::now()->subDays($days));

            $total = $query->count();
            $delivered = $query->where('status', self::STATUS_DELIVERED)->count();
            $clicked = $query->whereNotNull('clicked_at')->count();

            $stats[$category] = [
                'total' => $total,
                'delivered' => $delivered,
                'clicked' => $clicked,
                'click_rate' => $delivered > 0 ? round(($clicked / $delivered) * 100, 2) : 0
            ];
        }

        return $stats;
    }

    /**
     * Clean up old notification logs
     */
    public static function cleanup(int $daysToKeep = 90): int
    {
        $cutoffDate = Carbon::now()->subDays($daysToKeep);

        return self::where('created_at', '<', $cutoffDate)
                  ->where('status', '!=', self::STATUS_PENDING) // Don't delete pending notifications
                  ->delete();
    }

    /**
     * Get human-readable status
     */
    public function getStatusLabelAttribute(): string
    {
        return match($this->status) {
            self::STATUS_PENDING => 'Pending',
            self::STATUS_SENT => 'Sent',
            self::STATUS_DELIVERED => 'Delivered',
            self::STATUS_FAILED => 'Failed',
            self::STATUS_EXPIRED => 'Expired',
            default => 'Unknown'
        };
    }

    /**
     * Get priority color for UI
     */
    public function getPriorityColorAttribute(): string
    {
        return match($this->priority) {
            self::PRIORITY_LOW => 'gray',
            self::PRIORITY_NORMAL => 'blue',
            self::PRIORITY_HIGH => 'orange',
            self::PRIORITY_URGENT => 'red',
            default => 'gray'
        };
    }

    /**
     * Boot method to set up model events
     */
    protected static function boot()
    {
        parent::boot();

        // Set default values when creating
        static::creating(function ($log) {
            if (!$log->status) {
                $log->status = self::STATUS_PENDING;
            }
            if (!$log->priority) {
                $log->priority = self::PRIORITY_NORMAL;
            }
            if (!$log->category) {
                $log->category = self::CATEGORY_SYSTEM;
            }
            if (!$log->retry_count) {
                $log->retry_count = 0;
            }
        });

        // Log important events
        static::updated(function ($log) {
            if ($log->wasChanged('status') && $log->status === self::STATUS_FAILED) {
                \Log::warning('Notification delivery failed', [
                    'notification_id' => $log->id,
                    'user_id' => $log->user_id,
                    'error' => $log->error_message,
                    'retry_count' => $log->retry_count
                ]);
            }
        });
    }
}
