<?php

namespace Modules\MobileBridge\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class MobileNotificationApiController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    /**
     * Get user notifications
     */
    public function getNotifications(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $limit = $request->get('limit', 20);
            $page = $request->get('page', 1);
            $type = $request->get('type'); // system, user, reminder, alert
            $read = $request->get('read'); // true, false, null (all)
            $category = $request->get('category');

            // Get user notifications from cache
            $notificationsKey = "user_notifications_{$user->id}";
            $notifications = Cache::get($notificationsKey, []);

            // Apply filters
            $filteredNotifications = array_filter($notifications, function($notification) use ($type, $read, $category) {
                if ($type && $notification['type'] !== $type) {
                    return false;
                }
                if ($read !== null && $notification['read'] !== (bool)$read) {
                    return false;
                }
                if ($category && $notification['category'] !== $category) {
                    return false;
                }
                return true;
            });

            // Sort by creation date (newest first)
            usort($filteredNotifications, function($a, $b) {
                return Carbon::parse($b['created_at'])->gt(Carbon::parse($a['created_at'])) ? 1 : -1;
            });

            // Paginate
            $offset = ($page - 1) * $limit;
            $paginatedNotifications = array_slice($filteredNotifications, $offset, $limit);

            // Get unread count
            $unreadCount = count(array_filter($notifications, function($n) {
                return !$n['read'];
            }));

            return response()->json([
                'success' => true,
                'notifications' => array_values($paginatedNotifications),
                'unread_count' => $unreadCount,
                'pagination' => [
                    'current_page' => $page,
                    'per_page' => $limit,
                    'total' => count($filteredNotifications),
                    'last_page' => ceil(count($filteredNotifications) / $limit)
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get notifications: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to get notifications'
            ], 500);
        }
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(Request $request, string $notificationId): JsonResponse
    {
        try {
            $user = Auth::user();
            $notificationsKey = "user_notifications_{$user->id}";
            $notifications = Cache::get($notificationsKey, []);

            $notificationIndex = collect($notifications)->search(function($notification) use ($notificationId) {
                return $notification['id'] === $notificationId;
            });

            if ($notificationIndex === false) {
                return response()->json([
                    'success' => false,
                    'error' => 'Notification not found'
                ], 404);
            }

            // Mark as read
            $notifications[$notificationIndex]['read'] = true;
            $notifications[$notificationIndex]['read_at'] = now()->toISOString();

            // Update cache
            Cache::put($notificationsKey, $notifications, now()->addDays(30));

            // Update unread count
            $this->updateUnreadCount($user->id);

            Log::info('Notification marked as read', [
                'notification_id' => $notificationId,
                'user_id' => $user->id
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Notification marked as read'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to mark notification as read: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to mark notification as read'
            ], 500);
        }
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $notificationsKey = "user_notifications_{$user->id}";
            $notifications = Cache::get($notificationsKey, []);

            $readCount = 0;
            foreach ($notifications as &$notification) {
                if (!$notification['read']) {
                    $notification['read'] = true;
                    $notification['read_at'] = now()->toISOString();
                    $readCount++;
                }
            }

            // Update cache
            Cache::put($notificationsKey, $notifications, now()->addDays(30));

            // Update unread count
            $this->updateUnreadCount($user->id);

            Log::info('All notifications marked as read', [
                'user_id' => $user->id,
                'count' => $readCount
            ]);

            return response()->json([
                'success' => true,
                'message' => "Marked {$readCount} notifications as read",
                'count' => $readCount
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to mark all notifications as read: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to mark all notifications as read'
            ], 500);
        }
    }

    /**
     * Delete notification
     */
    public function deleteNotification(Request $request, string $notificationId): JsonResponse
    {
        try {
            $user = Auth::user();
            $notificationsKey = "user_notifications_{$user->id}";
            $notifications = Cache::get($notificationsKey, []);

            $notificationIndex = collect($notifications)->search(function($notification) use ($notificationId) {
                return $notification['id'] === $notificationId;
            });

            if ($notificationIndex === false) {
                return response()->json([
                    'success' => false,
                    'error' => 'Notification not found'
                ], 404);
            }

            // Remove notification
            array_splice($notifications, $notificationIndex, 1);

            // Update cache
            Cache::put($notificationsKey, $notifications, now()->addDays(30));

            // Update unread count
            $this->updateUnreadCount($user->id);

            Log::info('Notification deleted', [
                'notification_id' => $notificationId,
                'user_id' => $user->id
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Notification deleted'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to delete notification: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to delete notification'
            ], 500);
        }
    }

    /**
     * Clear all notifications
     */
    public function clearAllNotifications(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $notificationsKey = "user_notifications_{$user->id}";
            $notifications = Cache::get($notificationsKey, []);

            $deletedCount = count($notifications);

            // Clear all notifications
            Cache::forget($notificationsKey);

            // Update unread count
            $this->updateUnreadCount($user->id);

            Log::info('All notifications cleared', [
                'user_id' => $user->id,
                'count' => $deletedCount
            ]);

            return response()->json([
                'success' => true,
                'message' => "Cleared {$deletedCount} notifications",
                'count' => $deletedCount
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to clear all notifications: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to clear notifications'
            ], 500);
        }
    }

    /**
     * Get notification settings
     */
    public function getNotificationSettings(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $settingsKey = "notification_settings_{$user->id}";
            $settings = Cache::get($settingsKey, $this->getDefaultNotificationSettings());

            return response()->json([
                'success' => true,
                'settings' => $settings
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get notification settings: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to get notification settings'
            ], 500);
        }
    }

    /**
     * Update notification settings
     */
    public function updateNotificationSettings(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'push_enabled' => 'boolean',
                'email_enabled' => 'boolean',
                'sms_enabled' => 'boolean',
                'categories' => 'array',
                'categories.*' => 'boolean',
                'quiet_hours' => 'array',
                'quiet_hours.enabled' => 'boolean',
                'quiet_hours.start' => 'nullable|date_format:H:i',
                'quiet_hours.end' => 'nullable|date_format:H:i',
                'frequency' => 'in:immediate,hourly,daily,weekly',
                'sound' => 'string|max:50',
                'vibration' => 'boolean',
                'led_color' => 'string|max:7',
                'priority_override' => 'boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();
            $settingsKey = "notification_settings_{$user->id}";
            $currentSettings = Cache::get($settingsKey, $this->getDefaultNotificationSettings());

            // Update settings with provided values
            $updatedSettings = array_merge($currentSettings, array_filter($request->all(), function($value) {
                return $value !== null;
            }));

            $updatedSettings['updated_at'] = now()->toISOString();

            // Store updated settings
            Cache::put($settingsKey, $updatedSettings, now()->addDays(90));

            Log::info('Notification settings updated', [
                'user_id' => $user->id,
                'changes' => array_keys(array_filter($request->all(), function($value) {
                    return $value !== null;
                }))
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Notification settings updated',
                'settings' => $updatedSettings
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to update notification settings: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to update notification settings'
            ], 500);
        }
    }

    /**
     * Send test notification
     */
    public function sendTestNotification(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();

            $testNotification = [
                'id' => 'test_' . uniqid(),
                'title' => 'Test Notification',
                'message' => 'This is a test notification to verify your settings are working correctly.',
                'type' => 'system',
                'category' => 'test',
                'priority' => 'normal',
                'read' => false,
                'data' => [
                    'test' => true,
                    'timestamp' => now()->toISOString()
                ],
                'created_at' => now()->toISOString()
            ];

            // Add to user notifications
            $this->addNotificationToUser($user->id, $testNotification);

            Log::info('Test notification sent', [
                'user_id' => $user->id,
                'notification_id' => $testNotification['id']
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Test notification sent successfully',
                'notification' => $testNotification
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to send test notification: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to send test notification'
            ], 500);
        }
    }

    /**
     * Get notification statistics
     */
    public function getNotificationStats(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $notificationsKey = "user_notifications_{$user->id}";
            $notifications = Cache::get($notificationsKey, []);

            $stats = [
                'total_notifications' => count($notifications),
                'unread_notifications' => 0,
                'read_notifications' => 0,
                'notifications_by_type' => [],
                'notifications_by_category' => [],
                'recent_activity' => [],
                'average_read_time_minutes' => 0
            ];

            $readTimes = [];
            $recentActivity = [];

            foreach ($notifications as $notification) {
                // Count read/unread
                if ($notification['read']) {
                    $stats['read_notifications']++;

                    // Calculate read time if available
                    if (isset($notification['read_at'])) {
                        $readTime = Carbon::parse($notification['read_at'])
                                        ->diffInMinutes(Carbon::parse($notification['created_at']));
                        $readTimes[] = $readTime;
                    }
                } else {
                    $stats['unread_notifications']++;
                }

                // Count by type
                $type = $notification['type'] ?? 'unknown';
                $stats['notifications_by_type'][$type] = ($stats['notifications_by_type'][$type] ?? 0) + 1;

                // Count by category
                $category = $notification['category'] ?? 'general';
                $stats['notifications_by_category'][$category] = ($stats['notifications_by_category'][$category] ?? 0) + 1;

                // Recent activity (last 7 days)
                $createdAt = Carbon::parse($notification['created_at']);
                if ($createdAt->gte(now()->subDays(7))) {
                    $recentActivity[] = [
                        'date' => $createdAt->format('Y-m-d'),
                        'type' => $type,
                        'read' => $notification['read']
                    ];
                }
            }

            // Calculate average read time
            if (!empty($readTimes)) {
                $stats['average_read_time_minutes'] = round(array_sum($readTimes) / count($readTimes), 2);
            }

            // Group recent activity by date
            $stats['recent_activity'] = collect($recentActivity)
                ->groupBy('date')
                ->map(function($dayNotifications, $date) {
                    return [
                        'date' => $date,
                        'total' => count($dayNotifications),
                        'read' => count($dayNotifications->where('read', true)),
                        'unread' => count($dayNotifications->where('read', false))
                    ];
                })
                ->values()
                ->toArray();

            return response()->json([
                'success' => true,
                'stats' => $stats
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get notification stats: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to get notification statistics'
            ], 500);
        }
    }

    /**
     * Create a new notification for user
     */
    public function createNotification(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'message' => 'required|string|max:1000',
                'type' => 'required|in:system,user,reminder,alert,info',
                'category' => 'required|string|max:50',
                'priority' => 'in:low,normal,high,urgent',
                'data' => 'nullable|array',
                'action_url' => 'nullable|url',
                'expires_at' => 'nullable|date|after:now',
                'target_users' => 'nullable|array',
                'target_users.*' => 'integer|exists:users,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();

            // Check if user has permission to create notifications
            if (!$user->hasAnyRole(['admin', 'manager', 'notification_manager'])) {
                return response()->json([
                    'success' => false,
                    'error' => 'Insufficient permissions to create notifications'
                ], 403);
            }

            $notification = [
                'id' => 'notif_' . uniqid(),
                'title' => $request->title,
                'message' => $request->message,
                'type' => $request->type,
                'category' => $request->category,
                'priority' => $request->priority ?? 'normal',
                'data' => $request->data ?? [],
                'action_url' => $request->action_url,
                'expires_at' => $request->expires_at,
                'created_by' => $user->id,
                'created_by_name' => $user->name,
                'read' => false,
                'created_at' => now()->toISOString()
            ];

            // Determine target users
            $targetUsers = $request->target_users ?? [$user->id];

            $sentCount = 0;
            foreach ($targetUsers as $userId) {
                $this->addNotificationToUser($userId, $notification);
                $sentCount++;
            }

            Log::info('Notification created and sent', [
                'notification_id' => $notification['id'],
                'created_by' => $user->id,
                'target_users_count' => $sentCount,
                'type' => $request->type,
                'priority' => $notification['priority']
            ]);

            return response()->json([
                'success' => true,
                'message' => "Notification sent to {$sentCount} users",
                'notification_id' => $notification['id'],
                'sent_count' => $sentCount
            ], 201);

        } catch (\Exception $e) {
            Log::error('Failed to create notification: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to create notification'
            ], 500);
        }
    }

    /**
     * Get default notification settings
     */
    private function getDefaultNotificationSettings(): array
    {
        return [
            'push_enabled' => true,
            'email_enabled' => true,
            'sms_enabled' => false,
            'categories' => [
                'system' => true,
                'user' => true,
                'reminder' => true,
                'alert' => true,
                'info' => true,
                'marketing' => false
            ],
            'quiet_hours' => [
                'enabled' => false,
                'start' => '22:00',
                'end' => '08:00'
            ],
            'frequency' => 'immediate',
            'sound' => 'default',
            'vibration' => true,
            'led_color' => '#007bff',
            'priority_override' => true,
            'created_at' => now()->toISOString(),
            'updated_at' => now()->toISOString()
        ];
    }

    /**
     * Add notification to user's notification list
     */
    private function addNotificationToUser(int $userId, array $notification): void
    {
        $notificationsKey = "user_notifications_{$userId}";
        $notifications = Cache::get($notificationsKey, []);

        // Add new notification to the beginning of the array
        array_unshift($notifications, $notification);

        // Keep only the latest 500 notifications per user
        $notifications = array_slice($notifications, 0, 500);

        // Store updated notifications
        Cache::put($notificationsKey, $notifications, now()->addDays(30));

        // Update unread count
        $this->updateUnreadCount($userId);
    }

    /**
     * Update unread notification count for user
     */
    private function updateUnreadCount(int $userId): void
    {
        $notificationsKey = "user_notifications_{$userId}";
        $notifications = Cache::get($notificationsKey, []);

        $unreadCount = count(array_filter($notifications, function($notification) {
            return !$notification['read'];
        }));

        $unreadCountKey = "unread_notifications_{$userId}";
        Cache::put($unreadCountKey, $unreadCount, now()->addDays(30));
    }
}
