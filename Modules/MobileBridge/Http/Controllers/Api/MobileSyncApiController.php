<?php

namespace Modules\MobileBridge\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class MobileSyncApiController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    /**
     * Queue an action for offline sync
     */
    public function queueAction(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'action_type' => 'required|string|max:50',
                'action_data' => 'required|array',
                'timestamp' => 'required|integer',
                'device_id' => 'required|string|max:255'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();
            $actionId = uniqid('action_', true);

            // Store the queued action
            $queuedAction = [
                'id' => $actionId,
                'user_id' => $user->id,
                'action_type' => $request->action_type,
                'action_data' => $request->action_data,
                'timestamp' => $request->timestamp,
                'device_id' => $request->device_id,
                'status' => 'queued',
                'created_at' => now()->toISOString(),
                'attempts' => 0
            ];

            // Store in cache with expiration
            $cacheKey = "mobile_sync_queue_{$user->id}_{$actionId}";
            Cache::put($cacheKey, $queuedAction, now()->addDays(7));

            // Add to user's queue list
            $userQueueKey = "mobile_sync_user_queue_{$user->id}";
            $userQueue = Cache::get($userQueueKey, []);
            $userQueue[] = $actionId;
            Cache::put($userQueueKey, $userQueue, now()->addDays(7));

            Log::info('Mobile action queued', [
                'user_id' => $user->id,
                'action_id' => $actionId,
                'action_type' => $request->action_type
            ]);

            return response()->json([
                'success' => true,
                'action_id' => $actionId,
                'status' => 'queued'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to queue mobile action: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to queue action'
            ], 500);
        }
    }

    /**
     * Get pending actions for sync
     */
    public function getPendingActions(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $userQueueKey = "mobile_sync_user_queue_{$user->id}";
            $actionIds = Cache::get($userQueueKey, []);

            $pendingActions = [];
            foreach ($actionIds as $actionId) {
                $cacheKey = "mobile_sync_queue_{$user->id}_{$actionId}";
                $action = Cache::get($cacheKey);

                if ($action && $action['status'] === 'queued') {
                    $pendingActions[] = $action;
                }
            }

            return response()->json([
                'success' => true,
                'actions' => $pendingActions,
                'count' => count($pendingActions)
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get pending actions: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to get pending actions'
            ], 500);
        }
    }

    /**
     * Mark an action as completed
     */
    public function completeAction(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'action_id' => 'required|string',
                'status' => 'required|in:completed,failed',
                'result_data' => 'nullable|array',
                'error_message' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();
            $actionId = $request->action_id;
            $cacheKey = "mobile_sync_queue_{$user->id}_{$actionId}";

            $action = Cache::get($cacheKey);
            if (!$action) {
                return response()->json([
                    'success' => false,
                    'error' => 'Action not found'
                ], 404);
            }

            // Update action status
            $action['status'] = $request->status;
            $action['completed_at'] = now()->toISOString();
            $action['result_data'] = $request->result_data;
            $action['error_message'] = $request->error_message;

            Cache::put($cacheKey, $action, now()->addDays(1)); // Keep completed actions for 1 day

            // Remove from pending queue if completed successfully
            if ($request->status === 'completed') {
                $userQueueKey = "mobile_sync_user_queue_{$user->id}";
                $userQueue = Cache::get($userQueueKey, []);
                $userQueue = array_filter($userQueue, fn($id) => $id !== $actionId);
                Cache::put($userQueueKey, array_values($userQueue), now()->addDays(7));
            }

            Log::info('Mobile action completed', [
                'user_id' => $user->id,
                'action_id' => $actionId,
                'status' => $request->status
            ]);

            return response()->json([
                'success' => true,
                'status' => $request->status
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to complete mobile action: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to complete action'
            ], 500);
        }
    }

    /**
     * Get sync statistics
     */
    public function getSyncStats(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $userQueueKey = "mobile_sync_user_queue_{$user->id}";
            $actionIds = Cache::get($userQueueKey, []);

            $stats = [
                'pending_actions' => 0,
                'completed_actions' => 0,
                'failed_actions' => 0,
                'last_sync' => null
            ];

            foreach ($actionIds as $actionId) {
                $cacheKey = "mobile_sync_queue_{$user->id}_{$actionId}";
                $action = Cache::get($cacheKey);

                if ($action) {
                    switch ($action['status']) {
                        case 'queued':
                            $stats['pending_actions']++;
                            break;
                        case 'completed':
                            $stats['completed_actions']++;
                            break;
                        case 'failed':
                            $stats['failed_actions']++;
                            break;
                    }

                    if (isset($action['completed_at'])) {
                        $completedAt = Carbon::parse($action['completed_at']);
                        if (!$stats['last_sync'] || $completedAt->gt(Carbon::parse($stats['last_sync']))) {
                            $stats['last_sync'] = $action['completed_at'];
                        }
                    }
                }
            }

            return response()->json([
                'success' => true,
                'stats' => $stats
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get sync stats: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to get sync stats'
            ], 500);
        }
    }

    /**
     * Clear completed actions
     */
    public function clearCompleted(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $userQueueKey = "mobile_sync_user_queue_{$user->id}";
            $actionIds = Cache::get($userQueueKey, []);

            $clearedCount = 0;
            foreach ($actionIds as $actionId) {
                $cacheKey = "mobile_sync_queue_{$user->id}_{$actionId}";
                $action = Cache::get($cacheKey);

                if ($action && in_array($action['status'], ['completed', 'failed'])) {
                    Cache::forget($cacheKey);
                    $clearedCount++;
                }
            }

            // Update user queue to remove cleared actions
            $remainingActions = [];
            foreach ($actionIds as $actionId) {
                $cacheKey = "mobile_sync_queue_{$user->id}_{$actionId}";
                if (Cache::has($cacheKey)) {
                    $remainingActions[] = $actionId;
                }
            }
            Cache::put($userQueueKey, $remainingActions, now()->addDays(7));

            return response()->json([
                'success' => true,
                'cleared_count' => $clearedCount
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to clear completed actions: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to clear completed actions'
            ], 500);
        }
    }
}
