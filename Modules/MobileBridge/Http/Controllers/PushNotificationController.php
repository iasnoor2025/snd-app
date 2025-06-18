<?php

namespace Modules\MobileBridge\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Modules\MobileBridge\Entities\PushSubscription;
use Modules\MobileBridge\Entities\NotificationLog;
use Modules\MobileBridge\Services\NotificationService;
use Carbon\Carbon;

class PushNotificationController extends Controller
{
    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
        $this->middleware('auth:sanctum')->except(['getVapidKey']);
    }

    /**
     * Get VAPID public key
     */
    public function getVapidKey(): JsonResponse
    {
        try {
            $publicKey = config('mobilebridge.push_notifications.vapid.public_key');

            if (empty($publicKey)) {
                return response()->json([
                    'error' => 'VAPID public key not configured'
                ], 500);
            }

            return response()->json([
                'publicKey' => $publicKey
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to get VAPID key: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to get VAPID key'
            ], 500);
        }
    }

    /**
     * Subscribe to push notifications
     */
    public function subscribe(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'subscription' => 'required|array',
            'subscription.endpoint' => 'required|string|url',
            'subscription.keys' => 'required|array',
            'subscription.keys.p256dh' => 'required|string',
            'subscription.keys.auth' => 'required|string',
            'user_agent' => 'nullable|string',
            'platform' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Invalid subscription data',
                'details' => $validator->errors()
            ], 422);
        }

        try {
            $user = Auth::user();
            $subscriptionData = $request->input('subscription');

            // Check if subscription already exists
            $existingSubscription = PushSubscription::where('user_id', $user->id)
                ->where('endpoint', $subscriptionData['endpoint'])
                ->first();

            if ($existingSubscription) {
                // Update existing subscription
                $existingSubscription->update([
                    'p256dh_key' => $subscriptionData['keys']['p256dh'],
                    'auth_key' => $subscriptionData['keys']['auth'],
                    'user_agent' => $request->input('user_agent'),
                    'platform' => $request->input('platform'),
                    'is_active' => true,
                    'last_used_at' => now()
                ]);

                $subscription = $existingSubscription;
            } else {
                // Create new subscription
                $subscription = PushSubscription::create([
                    'user_id' => $user->id,
                    'endpoint' => $subscriptionData['endpoint'],
                    'p256dh_key' => $subscriptionData['keys']['p256dh'],
                    'auth_key' => $subscriptionData['keys']['auth'],
                    'user_agent' => $request->input('user_agent'),
                    'platform' => $request->input('platform'),
                    'is_active' => true,
                    'subscribed_at' => now(),
                    'last_used_at' => now()
                ]);
            }

            // Send welcome notification
            $this->pushService->sendWelcomeNotification($subscription);

            Log::info('Push subscription created/updated', [
                'user_id' => $user->id,
                'subscription_id' => $subscription->id,
                'endpoint' => $subscriptionData['endpoint']
            ]);

            return response()->json([
                'message' => 'Successfully subscribed to push notifications',
                'subscription_id' => $subscription->id
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create push subscription: ' . $e->getMessage(), [
                'user_id' => Auth::id(),
                'request_data' => $request->all()
            ]);

            return response()->json([
                'error' => 'Failed to subscribe to push notifications'
            ], 500);
        }
    }

    /**
     * Unsubscribe from push notifications
     */
    public function unsubscribe(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'subscription' => 'required|array',
            'subscription.endpoint' => 'required|string|url'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Invalid subscription data',
                'details' => $validator->errors()
            ], 422);
        }

        try {
            $user = Auth::user();
            $endpoint = $request->input('subscription.endpoint');

            $subscription = PushSubscription::where('user_id', $user->id)
                ->where('endpoint', $endpoint)
                ->first();

            if ($subscription) {
                $subscription->update([
                    'is_active' => false,
                    'unsubscribed_at' => now()
                ]);

                Log::info('Push subscription deactivated', [
                    'user_id' => $user->id,
                    'subscription_id' => $subscription->id,
                    'endpoint' => $endpoint
                ]);
            }

            return response()->json([
                'message' => 'Successfully unsubscribed from push notifications'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to unsubscribe from push notifications: ' . $e->getMessage(), [
                'user_id' => Auth::id(),
                'endpoint' => $request->input('subscription.endpoint')
            ]);

            return response()->json([
                'error' => 'Failed to unsubscribe from push notifications'
            ], 500);
        }
    }

    /**
     * Sync subscription with server
     */
    public function sync(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'subscription' => 'required|array',
            'subscription.endpoint' => 'required|string|url'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Invalid subscription data',
                'details' => $validator->errors()
            ], 422);
        }

        try {
            $user = Auth::user();
            $endpoint = $request->input('subscription.endpoint');

            $subscription = PushSubscription::where('user_id', $user->id)
                ->where('endpoint', $endpoint)
                ->first();

            if ($subscription) {
                $subscription->update([
                    'last_used_at' => now()
                ]);

                return response()->json([
                    'message' => 'Subscription synced successfully',
                    'subscription' => [
                        'id' => $subscription->id,
                        'is_active' => $subscription->is_active,
                        'last_used_at' => $subscription->last_used_at
                    ]
                ]);
            }

            return response()->json([
                'message' => 'Subscription not found'
            ], 404);
        } catch (\Exception $e) {
            Log::error('Failed to sync subscription: ' . $e->getMessage(), [
                'user_id' => Auth::id(),
                'endpoint' => $request->input('subscription.endpoint')
            ]);

            return response()->json([
                'error' => 'Failed to sync subscription'
            ], 500);
        }
    }

    /**
     * Get push notification statistics
     */
    public function getStats(): JsonResponse
    {
        try {
            $user = Auth::user();
            $cacheKey = "push_stats_{$user->id}";

            $stats = Cache::remember($cacheKey, 300, function () use ($user) {
                $logs = NotificationLog::where('user_id', $user->id);

                return [
                    'sent' => $logs->count(),
                    'delivered' => $logs->where('status', 'delivered')->count(),
                    'clicked' => $logs->where('clicked_at', '!=', null)->count(),
                    'dismissed' => $logs->where('dismissed_at', '!=', null)->count(),
                    'failed' => $logs->where('status', 'failed')->count()
                ];
            });

            return response()->json($stats);
        } catch (\Exception $e) {
            Log::error('Failed to get push notification stats: ' . $e->getMessage(), [
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'sent' => 0,
                'delivered' => 0,
                'clicked' => 0,
                'dismissed' => 0,
                'failed' => 0
            ]);
        }
    }

    /**
     * Track notification interaction
     */
    public function track(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'tag' => 'required|string',
            'action' => 'required|string|in:click,dismiss,view',
            'timestamp' => 'required|integer'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Invalid tracking data',
                'details' => $validator->errors()
            ], 422);
        }

        try {
            $user = Auth::user();
            $tag = $request->input('tag');
            $action = $request->input('action');
            $timestamp = $request->input('timestamp');

            // Find the notification log entry
            $log = NotificationLog::where('user_id', $user->id)
                ->where('tag', $tag)
                ->orderBy('created_at', 'desc')
                ->first();

            if ($log) {
                $updateData = [];

                switch ($action) {
                    case 'click':
                        $updateData['clicked_at'] = Carbon::createFromTimestamp($timestamp / 1000);
                        break;
                    case 'dismiss':
                        $updateData['dismissed_at'] = Carbon::createFromTimestamp($timestamp / 1000);
                        break;
                    case 'view':
                        $updateData['viewed_at'] = Carbon::createFromTimestamp($timestamp / 1000);
                        break;
                }

                $log->update($updateData);

                // Clear stats cache
                Cache::forget("push_stats_{$user->id}");
            }

            return response()->json([
                'message' => 'Interaction tracked successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to track notification interaction: ' . $e->getMessage(), [
                'user_id' => Auth::id(),
                'tag' => $request->input('tag'),
                'action' => $request->input('action')
            ]);

            return response()->json([
                'error' => 'Failed to track interaction'
            ], 500);
        }
    }

    /**
     * Send test notification
     */
    public function sendTest(): JsonResponse
    {
        try {
            $user = Auth::user();

            $subscription = PushSubscription::where('user_id', $user->id)
                ->where('is_active', true)
                ->first();

            if (!$subscription) {
                return response()->json([
                    'error' => 'No active push subscription found'
                ], 404);
            }

            $result = $this->pushService->sendTestNotification($subscription);

            if ($result['success']) {
                return response()->json([
                    'message' => 'Test notification sent successfully'
                ]);
            } else {
                return response()->json([
                    'error' => 'Failed to send test notification',
                    'details' => $result['error'] ?? 'Unknown error'
                ], 500);
            }
        } catch (\Exception $e) {
            Log::error('Failed to send test notification: ' . $e->getMessage(), [
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'error' => 'Failed to send test notification'
            ], 500);
        }
    }

    /**
     * Get user's push subscriptions
     */
    public function getSubscriptions(): JsonResponse
    {
        try {
            $user = Auth::user();

            $subscriptions = PushSubscription::where('user_id', $user->id)
                ->select(['id', 'endpoint', 'platform', 'user_agent', 'is_active', 'subscribed_at', 'last_used_at'])
                ->orderBy('last_used_at', 'desc')
                ->get();

            return response()->json([
                'subscriptions' => $subscriptions
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to get push subscriptions: ' . $e->getMessage(), [
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'error' => 'Failed to get subscriptions'
            ], 500);
        }
    }

    /**
     * Delete a specific subscription
     */
    public function deleteSubscription(Request $request, $subscriptionId): JsonResponse
    {
        try {
            $user = Auth::user();

            $subscription = PushSubscription::where('user_id', $user->id)
                ->where('id', $subscriptionId)
                ->first();

            if (!$subscription) {
                return response()->json([
                    'error' => 'Subscription not found'
                ], 404);
            }

            $subscription->delete();

            Log::info('Push subscription deleted', [
                'user_id' => $user->id,
                'subscription_id' => $subscriptionId
            ]);

            return response()->json([
                'message' => 'Subscription deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to delete push subscription: ' . $e->getMessage(), [
                'user_id' => Auth::id(),
                'subscription_id' => $subscriptionId
            ]);

            return response()->json([
                'error' => 'Failed to delete subscription'
            ], 500);
        }
    }

    /**
     * Send notification to specific user
     */
    public function sendToUser(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|integer|exists:users,id',
            'title' => 'required|string|max:255',
            'body' => 'required|string|max:500',
            'icon' => 'nullable|string|url',
            'url' => 'nullable|string|url',
            'tag' => 'nullable|string|max:100',
            'data' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Invalid notification data',
                'details' => $validator->errors()
            ], 422);
        }

        try {
            $userId = $request->input('user_id');
            $notificationData = [
                'title' => $request->input('title'),
                'body' => $request->input('body'),
                'icon' => $request->input('icon'),
                'url' => $request->input('url'),
                'tag' => $request->input('tag'),
                'data' => $request->input('data', [])
            ];

            $result = $this->pushService->sendToUser($userId, $notificationData);

            if ($result['success']) {
                return response()->json([
                    'message' => 'Notification sent successfully',
                    'sent_count' => $result['sent_count'] ?? 0
                ]);
            } else {
                return response()->json([
                    'error' => 'Failed to send notification',
                    'details' => $result['error'] ?? 'Unknown error'
                ], 500);
            }
        } catch (\Exception $e) {
            Log::error('Failed to send notification to user: ' . $e->getMessage(), [
                'user_id' => $request->input('user_id'),
                'sender_id' => Auth::id()
            ]);

            return response()->json([
                'error' => 'Failed to send notification'
            ], 500);
        }
    }
}
