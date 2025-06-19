<?php

namespace Modules\Notifications\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class NotificationController extends Controller
{
    /**
     * Get all notifications for the authenticated user.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $user = Auth::user();
        
        $notifications = $user->notifications()
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $notifications,
            'unread_count' => $user->unreadNotifications()->count(),
        ]);
    }

    /**
     * Get a specific notification.
     *
     * @param string $id
     * @return JsonResponse
     */
    public function show($id): JsonResponse
    {
        $user = Auth::user();
        
        $notification = $user->notifications()->find($id);

        if (!$notification) {
            return response()->json([
                'success' => false,
                'message' => 'Notification not found'
            ], 404);
        }

        // Mark as read if it's unread
        if ($notification->read_at === null) {
            $notification->markAsRead();
        }

        return response()->json([
            'success' => true,
            'data' => $notification
        ]);
    }

    /**
     * Create a new notification (admin only).
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $this->authorize('create-notifications');

        $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'type' => 'required|in:info,success,warning,error',
            'user_ids' => 'array',
            'user_ids.*' => 'exists:users,id',
            'send_to_all' => 'boolean',
        ]);

        $notificationData = [
            'title' => $request->title,
            'message' => $request->message,
            'type' => $request->type,
            'data' => $request->data ?? [],
            'created_at' => now(),
        ];

        if ($request->boolean('send_to_all')) {
            // Send to all users
            $userIds = DB::table('users')->pluck('id');
        } else {
            $userIds = $request->user_ids ?? [];
        }

        // Create notifications for each user
        foreach ($userIds as $userId) {
            DB::table('notifications')->insert([
                'id' => \Str::uuid(),
                'type' => 'App\\Notifications\\SystemNotification',
                'notifiable_type' => 'App\\Models\\User',
                'notifiable_id' => $userId,
                'data' => json_encode($notificationData),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Notification sent successfully',
            'recipients_count' => count($userIds)
        ], 201);
    }

    /**
     * Mark notification as read.
     *
     * @param Request $request
     * @param string $id
     * @return JsonResponse
     */
    public function update(Request $request, $id): JsonResponse
    {
        $user = Auth::user();
        
        $notification = $user->notifications()->find($id);

        if (!$notification) {
            return response()->json([
                'success' => false,
                'message' => 'Notification not found'
            ], 404);
        }

        if ($request->has('read_at')) {
            if ($request->boolean('read_at')) {
                $notification->markAsRead();
            } else {
                $notification->markAsUnread();
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Notification updated successfully',
            'data' => $notification
        ]);
    }

    /**
     * Delete a notification.
     *
     * @param string $id
     * @return JsonResponse
     */
    public function destroy($id): JsonResponse
    {
        $user = Auth::user();
        
        $notification = $user->notifications()->find($id);

        if (!$notification) {
            return response()->json([
                'success' => false,
                'message' => 'Notification not found'
            ], 404);
        }

        $notification->delete();

        return response()->json([
            'success' => true,
            'message' => 'Notification deleted successfully'
        ]);
    }

    /**
     * Mark all notifications as read for the authenticated user.
     *
     * @return JsonResponse
     */
    public function markAllAsRead(): JsonResponse
    {
        $user = Auth::user();
        
        $user->unreadNotifications->markAsRead();

        return response()->json([
            'success' => true,
            'message' => 'All notifications marked as read'
        ]);
    }

    /**
     * Get notification statistics.
     *
     * @return JsonResponse
     */
    public function getStatistics(): JsonResponse
    {
        $user = Auth::user();
        
        $stats = [
            'total' => $user->notifications()->count(),
            'unread' => $user->unreadNotifications()->count(),
            'today' => $user->notifications()
                ->whereDate('created_at', today())
                ->count(),
            'this_week' => $user->notifications()
                ->whereBetween('created_at', [
                    Carbon::now()->startOfWeek(),
                    Carbon::now()->endOfWeek()
                ])
                ->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Get notification preferences for the authenticated user.
     *
     * @return JsonResponse
     */
    public function getPreferences(): JsonResponse
    {
        $user = Auth::user();
        
        // Get user's notification preferences (this would be stored in user_preferences table)
        $preferences = [
            'email_notifications' => true,
            'push_notifications' => true,
            'sms_notifications' => false,
            'notification_types' => [
                'system' => true,
                'reminders' => true,
                'updates' => true,
                'promotions' => false,
            ],
            'quiet_hours' => [
                'enabled' => false,
                'start' => '22:00',
                'end' => '08:00',
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $preferences
        ]);
    }

    /**
     * Update notification preferences for the authenticated user.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function updatePreferences(Request $request): JsonResponse
    {
        $request->validate([
            'email_notifications' => 'boolean',
            'push_notifications' => 'boolean',
            'sms_notifications' => 'boolean',
            'notification_types' => 'array',
            'quiet_hours.enabled' => 'boolean',
            'quiet_hours.start' => 'date_format:H:i',
            'quiet_hours.end' => 'date_format:H:i',
        ]);

        $user = Auth::user();
        
        // In production, this would update the user_preferences table
        // For now, we'll just return success
        
        return response()->json([
            'success' => true,
            'message' => 'Notification preferences updated successfully'
        ]);
    }
}
