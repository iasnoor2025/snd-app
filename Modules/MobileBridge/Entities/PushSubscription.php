<?php

namespace Modules\MobileBridge\Entities;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\User;
use Carbon\Carbon;

class PushSubscription extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'push_subscriptions';

    protected $fillable = [
        'user_id',
        'endpoint',
        'p256dh_key',
        'auth_key',
        'user_agent',
        'platform',
        'is_active',
        'subscribed_at',
        'unsubscribed_at',
        'last_used_at',
        'failure_count',
        'last_failure_at',
        'metadata'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'subscribed_at' => 'datetime',
        'unsubscribed_at' => 'datetime',
        'last_used_at' => 'datetime',
        'last_failure_at' => 'datetime',
        'failure_count' => 'integer',
        'metadata' => 'array'
    ];

    protected $dates = [
        'subscribed_at',
        'unsubscribed_at',
        'last_used_at',
        'last_failure_at',
        'deleted_at'
    ];

    /**
     * Get the user that owns the subscription
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the notification logs for this subscription
     */
    public function notificationLogs(): HasMany
    {
        return $this->hasMany(NotificationLog::class);
    }

    /**
     * Scope to get only active subscriptions
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get subscriptions for a specific user
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope to get subscriptions by platform
     */
    public function scopeByPlatform($query, $platform)
    {
        return $query->where('platform', $platform);
    }

    /**
     * Scope to get recently used subscriptions
     */
    public function scopeRecentlyUsed($query, $days = 30)
    {
        return $query->where('last_used_at', '>=', Carbon::now()->subDays($days));
    }

    /**
     * Scope to get subscriptions with low failure count
     */
    public function scopeReliable($query, $maxFailures = 5)
    {
        return $query->where('failure_count', '<=', $maxFailures);
    }

    /**
     * Check if subscription is valid and active
     */
    public function isValid(): bool
    {
        return $this->is_active &&
               !empty($this->endpoint) &&
               !empty($this->p256dh_key) &&
               !empty($this->auth_key) &&
               $this->failure_count < 10; // Max 10 failures before considering invalid
    }

    /**
     * Mark subscription as used
     */
    public function markAsUsed(): void
    {
        $this->update([
            'last_used_at' => now()
        ]);
    }

    /**
     * Record a failure
     */
    public function recordFailure(string $error = null): void
    {
        $this->increment('failure_count');
        $this->update([
            'last_failure_at' => now()
        ]);

        // Deactivate if too many failures
        if ($this->failure_count >= 10) {
            $this->update([
                'is_active' => false,
                'unsubscribed_at' => now()
            ]);
        }

        // Store error in metadata if provided
        if ($error) {
            $metadata = $this->metadata ?? [];
            $metadata['last_error'] = $error;
            $metadata['error_history'] = array_slice(
                array_merge($metadata['error_history'] ?? [], [$error]),
                -5 // Keep only last 5 errors
            );
            $this->update(['metadata' => $metadata]);
        }
    }

    /**
     * Reset failure count (on successful delivery)
     */
    public function resetFailures(): void
    {
        if ($this->failure_count > 0) {
            $this->update([
                'failure_count' => 0,
                'last_failure_at' => null
            ]);
        }
    }

    /**
     * Deactivate subscription
     */
    public function deactivate(): void
    {
        $this->update([
            'is_active' => false,
            'unsubscribed_at' => now()
        ]);
    }

    /**
     * Reactivate subscription
     */
    public function reactivate(): void
    {
        $this->update([
            'is_active' => true,
            'unsubscribed_at' => null,
            'failure_count' => 0,
            'last_failure_at' => null
        ]);
    }

    /**
     * Get subscription data for push service
     */
    public function getSubscriptionData(): array
    {
        return [
            'endpoint' => $this->endpoint,
            'keys' => [
                'p256dh' => $this->p256dh_key,
                'auth' => $this->auth_key
            ]
        ];
    }

    /**
     * Get platform information
     */
    public function getPlatformInfo(): array
    {
        $userAgent = $this->user_agent ?? '';
        $platform = $this->platform ?? '';

        // Detect browser from user agent
        $browser = 'Unknown';
        if (str_contains($userAgent, 'Chrome')) {
            $browser = 'Chrome';
        } elseif (str_contains($userAgent, 'Firefox')) {
            $browser = 'Firefox';
        } elseif (str_contains($userAgent, 'Safari')) {
            $browser = 'Safari';
        } elseif (str_contains($userAgent, 'Edge')) {
            $browser = 'Edge';
        }

        // Detect OS from platform or user agent
        $os = 'Unknown';
        if (str_contains($platform, 'Win') || str_contains($userAgent, 'Windows')) {
            $os = 'Windows';
        } elseif (str_contains($platform, 'Mac') || str_contains($userAgent, 'Macintosh')) {
            $os = 'macOS';
        } elseif (str_contains($platform, 'Linux') || str_contains($userAgent, 'Linux')) {
            $os = 'Linux';
        } elseif (str_contains($userAgent, 'Android')) {
            $os = 'Android';
        } elseif (str_contains($userAgent, 'iOS') || str_contains($userAgent, 'iPhone') || str_contains($userAgent, 'iPad')) {
            $os = 'iOS';
        }

        return [
            'browser' => $browser,
            'os' => $os,
            'platform' => $platform,
            'user_agent' => $userAgent
        ];
    }

    /**
     * Get subscription statistics
     */
    public function getStats(): array
    {
        $logs = $this->notificationLogs();

        return [
            'total_notifications' => $logs->count(),
            'delivered' => $logs->where('status', 'delivered')->count(),
            'failed' => $logs->where('status', 'failed')->count(),
            'clicked' => $logs->whereNotNull('clicked_at')->count(),
            'dismissed' => $logs->whereNotNull('dismissed_at')->count(),
            'failure_rate' => $this->failure_count,
            'last_used' => $this->last_used_at?->diffForHumans(),
            'active_days' => $this->subscribed_at ? $this->subscribed_at->diffInDays(now()) : 0
        ];
    }

    /**
     * Check if subscription needs cleanup
     */
    public function needsCleanup(): bool
    {
        // Cleanup if:
        // 1. Inactive for more than 90 days
        // 2. Too many failures
        // 3. Explicitly unsubscribed more than 30 days ago

        $inactiveThreshold = Carbon::now()->subDays(90);
        $unsubscribedThreshold = Carbon::now()->subDays(30);

        return (!$this->is_active && $this->unsubscribed_at && $this->unsubscribed_at < $unsubscribedThreshold) ||
               ($this->last_used_at && $this->last_used_at < $inactiveThreshold) ||
               $this->failure_count >= 15;
    }

    /**
     * Get human-readable status
     */
    public function getStatusAttribute(): string
    {
        if (!$this->is_active) {
            return 'Inactive';
        }

        if ($this->failure_count >= 5) {
            return 'Unreliable';
        }

        if ($this->last_used_at && $this->last_used_at < Carbon::now()->subDays(7)) {
            return 'Stale';
        }

        return 'Active';
    }

    /**
     * Boot method to set up model events
     */
    protected static function boot()
    {
        parent::boot();

        // Set subscribed_at when creating
        static::creating(function ($subscription) {
            if (!$subscription->subscribed_at) {
                $subscription->subscribed_at = now();
            }
            if (!$subscription->last_used_at) {
                $subscription->last_used_at = now();
            }
        });

        // Log subscription events
        static::created(function ($subscription) {
            \Log::info('Push subscription created', [
                'subscription_id' => $subscription->id,
                'user_id' => $subscription->user_id,
                'endpoint' => $subscription->endpoint
            ]);
        });

        static::updated(function ($subscription) {
            if ($subscription->wasChanged('is_active')) {
                \Log::info('Push subscription status changed', [
                    'subscription_id' => $subscription->id,
                    'user_id' => $subscription->user_id,
                    'is_active' => $subscription->is_active
                ]);
            }
        });

        static::deleted(function ($subscription) {
            \Log::info('Push subscription deleted', [
                'subscription_id' => $subscription->id,
                'user_id' => $subscription->user_id
            ]);
        });
    }
}
