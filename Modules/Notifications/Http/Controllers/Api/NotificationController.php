<?php

namespace Modules\Notifications\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Notifications\DatabaseNotification;

class NotificationController extends Controller
{
    /**
     * Display a listing of notifications for the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $query = $user->notifications();

            // Apply filters if provided
            if ($request->has('read')) {
                if ($request->boolean('read')) {
                    $query->whereNotNull('read_at');
                } else {
                    $query->whereNull('read_at');
                }
            }

            if ($request->has('type')) {
                $query->where('type', $request->type);
            }

            if ($request->has('date_from')) {
                $query->whereDate('created_at', '>=', $request->date_from);
            }

            if ($request->has('date_to')) {
                $query->whereDate('created_at', '<=', $request->date_to);
            }

            $notifications = $query->orderBy('created_at', 'desc')
                                  ->paginate($request->get('per_page', 20));

            return response()->json([
                'success' => true,
                'data' => $notifications,
                'message' => 'Notifications retrieved successfully'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve notifications',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Display the specified notification.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $user = Auth::user();
            $notification = $user->notifications()->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $notification,
                'message' => 'Notification retrieved successfully'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Notification not found',
                'error' => $e->getMessage()
            ], Response::HTTP_NOT_FOUND);
        }
    }

    /**
     * Mark notification as read.
     */
    public function markAsRead(string $id): JsonResponse
    {
        try {
            $user = Auth::user();
            $notification = $user->notifications()->findOrFail($id);

            if ($notification->read_at === null) {
                $notification->markAsRead();
            }

            return response()->json([
                'success' => true,
                'data' => $notification->fresh(),
                'message' => 'Notification marked as read'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark notification as read',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Mark notification as unread.
     */
    public function markAsUnread(string $id): JsonResponse
    {
        try {
            $user = Auth::user();
            $notification = $user->notifications()->findOrFail($id);

            if ($notification->read_at !== null) {
                $notification->update(['read_at' => null]);
            }

            return response()->json([
                'success' => true,
                'data' => $notification->fresh(),
                'message' => 'Notification marked as unread'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark notification as unread',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(): JsonResponse
    {
        try {
            $user = Auth::user();
            $user->unreadNotifications->markAsRead();

            return response()->json([
                'success' => true,
                'message' => 'All notifications marked as read'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark all notifications as read',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Delete the specified notification.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $user = Auth::user();
            $notification = $user->notifications()->findOrFail($id);
            $notification->delete();

            return response()->json([
                'success' => true,
                'message' => 'Notification deleted successfully'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete notification',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Delete all notifications for the authenticated user.
     */
    public function destroyAll(): JsonResponse
    {
        try {
            $user = Auth::user();
            $user->notifications()->delete();

            return response()->json([
                'success' => true,
                'message' => 'All notifications deleted successfully'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete all notifications',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get notification statistics.
     */
    public function stats(): JsonResponse
    {
        try {
            $user = Auth::user();

            $stats = [
                'total' => $user->notifications()->count(),
                'unread' => $user->unreadNotifications()->count(),
                'read' => $user->readNotifications()->count(),
                'today' => $user->notifications()->whereDate('created_at', today())->count(),
                'this_week' => $user->notifications()->whereBetween('created_at', [
                    now()->startOfWeek(),
                    now()->endOfWeek()
                ])->count(),
                'this_month' => $user->notifications()->whereMonth('created_at', now()->month)
                                   ->whereYear('created_at', now()->year)
                                   ->count()
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'Notification statistics retrieved successfully'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve notification statistics',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get notification types.
     */
    public function types(): JsonResponse
    {
        try {
            $user = Auth::user();

            $types = $user->notifications()
                         ->select('type')
                         ->distinct()
                         ->pluck('type')
                         ->map(function ($type) {
                             // Extract class name from full namespace
                             $parts = explode('\\', $type);
                             return [
                                 'full_name' => $type,
                                 'short_name' => end($parts),
                                 'display_name' => $this->formatTypeName(end($parts))
                             ];
                         });

            return response()->json([
                'success' => true,
                'data' => $types,
                'message' => 'Notification types retrieved successfully'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve notification types',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Bulk operations on notifications.
     */
    public function bulkAction(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'action' => 'required|in:mark_read,mark_unread,delete',
                'notification_ids' => 'required|array',
                'notification_ids.*' => 'string'
            ]);

            $user = Auth::user();
            $notifications = $user->notifications()
                                 ->whereIn('id', $validated['notification_ids']);

            switch ($validated['action']) {
                case 'mark_read':
                    $notifications->whereNull('read_at')->update(['read_at' => now()]);
                    $message = 'Notifications marked as read';
                    break;

                case 'mark_unread':
                    $notifications->whereNotNull('read_at')->update(['read_at' => null]);
                    $message = 'Notifications marked as unread';
                    break;

                case 'delete':
                    $notifications->delete();
                    $message = 'Notifications deleted successfully';
                    break;
            }

            return response()->json([
                'success' => true,
                'message' => $message
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to perform bulk action',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Format notification type name for display.
     */
    private function formatTypeName(string $typeName): string
    {
        // Remove 'Notification' suffix if present
        $name = str_replace('Notification', '', $typeName);

        // Convert PascalCase to Title Case
        return ucwords(strtolower(preg_replace('/(?<!^)[A-Z]/', ' $0', $name)));
    }
}
