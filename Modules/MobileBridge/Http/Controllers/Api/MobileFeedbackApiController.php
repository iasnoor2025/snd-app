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

class MobileFeedbackApiController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    /**
     * Store user feedback
     */
    public function storeFeedback(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'type' => 'required|in:bug_report,feature_request,general_feedback,rating,complaint,suggestion',
                'category' => 'required|in:ui_ux,performance,functionality,content,other',
                'title' => 'required|string|max:255',
                'description' => 'required|string|max:2000',
                'rating' => 'nullable|integer|min:1|max:5',
                'priority' => 'nullable|in:low,medium,high,critical',
                'device_info' => 'nullable|array',
                'device_info.type' => 'nullable|string',
                'device_info.model' => 'nullable|string',
                'device_info.os_version' => 'nullable|string',
                'device_info.app_version' => 'nullable|string',
                'device_info.screen_resolution' => 'nullable|string',
                'attachments' => 'nullable|array|max:5',
                'attachments.*' => 'file|max:10240|mimes:jpg,jpeg,png,gif,pdf,txt,log', // 10MB max per file
                'steps_to_reproduce' => 'nullable|string|max:1000',
                'expected_behavior' => 'nullable|string|max:1000',
                'actual_behavior' => 'nullable|string|max:1000',
                'tags' => 'nullable|array',
                'tags.*' => 'string|max:50'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();
            $feedbackId = uniqid('feedback_', true);

            // Handle file attachments
            $attachments = [];
            if ($request->hasFile('attachments')) {
                foreach ($request->file('attachments') as $file) {
                    $path = $file->store('feedback_attachments', 'public');
                    $attachments[] = [
                        'original_name' => $file->getClientOriginalName(),
                        'path' => $path,
                        'size' => $file->getSize(),
                        'mime_type' => $file->getMimeType()
                    ];
                }
            }

            $feedbackData = [
                'id' => $feedbackId,
                'user_id' => $user->id,
                'user_name' => $user->name,
                'user_email' => $user->email,
                'type' => $request->type,
                'category' => $request->category,
                'title' => $request->title,
                'description' => $request->description,
                'rating' => $request->rating,
                'priority' => $request->priority ?? 'medium',
                'status' => 'submitted',
                'device_info' => $request->device_info ?? [],
                'attachments' => $attachments,
                'steps_to_reproduce' => $request->steps_to_reproduce,
                'expected_behavior' => $request->expected_behavior,
                'actual_behavior' => $request->actual_behavior,
                'tags' => $request->tags ?? [],
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'submitted_at' => now()->toISOString(),
                'updated_at' => now()->toISOString()
            ];

            // Store feedback in cache (in production, this would go to database)
            $cacheKey = "feedback_{$feedbackId}";
            Cache::put($cacheKey, $feedbackData, now()->addDays(30));

            // Add to user's feedback list
            $userFeedbackKey = "user_feedback_{$user->id}";
            $userFeedback = Cache::get($userFeedbackKey, []);
            $userFeedback[] = $feedbackId;
            Cache::put($userFeedbackKey, $userFeedback, now()->addDays(30));

            // Add to global feedback queue for admin review
            $globalFeedbackKey = 'global_feedback_queue';
            $globalFeedback = Cache::get($globalFeedbackKey, []);
            $globalFeedback[] = $feedbackId;
            Cache::put($globalFeedbackKey, $globalFeedback, now()->addDays(30));

            // Send notification to admins for high priority feedback
            if (in_array($request->priority, ['high', 'critical'])) {
                $this->notifyAdmins($feedbackData);
            }

            Log::info('Feedback submitted', [
                'feedback_id' => $feedbackId,
                'user_id' => $user->id,
                'type' => $request->type,
                'category' => $request->category,
                'priority' => $request->priority
            ]);

            return response()->json([
                'success' => true,
                'feedback_id' => $feedbackId,
                'message' => 'Feedback submitted successfully',
                'status' => 'submitted',
                'submitted_at' => $feedbackData['submitted_at']
            ], 201);

        } catch (\Exception $e) {
            Log::error('Failed to store feedback: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to submit feedback'
            ], 500);
        }
    }

    /**
     * Get user's feedback history
     */
    public function getUserFeedback(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $limit = $request->get('limit', 20);
            $page = $request->get('page', 1);
            $status = $request->get('status'); // submitted, in_review, resolved, closed
            $type = $request->get('type');

            $userFeedbackKey = "user_feedback_{$user->id}";
            $feedbackIds = Cache::get($userFeedbackKey, []);

            $feedbackList = [];
            foreach ($feedbackIds as $feedbackId) {
                $cacheKey = "feedback_{$feedbackId}";
                $feedback = Cache::get($cacheKey);

                if ($feedback) {
                    // Apply filters
                    if ($status && $feedback['status'] !== $status) {
                        continue;
                    }
                    if ($type && $feedback['type'] !== $type) {
                        continue;
                    }

                    // Remove sensitive data for user view
                    unset($feedback['ip_address'], $feedback['user_agent']);
                    $feedbackList[] = $feedback;
                }
            }

            // Sort by submission date (newest first)
            usort($feedbackList, function($a, $b) {
                return Carbon::parse($b['submitted_at'])->gt(Carbon::parse($a['submitted_at'])) ? 1 : -1;
            });

            // Paginate
            $offset = ($page - 1) * $limit;
            $paginatedFeedback = array_slice($feedbackList, $offset, $limit);

            return response()->json([
                'success' => true,
                'feedback' => $paginatedFeedback,
                'pagination' => [
                    'current_page' => $page,
                    'per_page' => $limit,
                    'total' => count($feedbackList),
                    'last_page' => ceil(count($feedbackList) / $limit)
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get user feedback: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to get feedback history'
            ], 500);
        }
    }

    /**
     * Get specific feedback details
     */
    public function getFeedback(Request $request, string $feedbackId): JsonResponse
    {
        try {
            $user = Auth::user();
            $cacheKey = "feedback_{$feedbackId}";
            $feedback = Cache::get($cacheKey);

            if (!$feedback) {
                return response()->json([
                    'success' => false,
                    'error' => 'Feedback not found'
                ], 404);
            }

            // Check if user owns this feedback or is admin
            if ($feedback['user_id'] !== $user->id && !$user->hasRole('admin')) {
                return response()->json([
                    'success' => false,
                    'error' => 'Access denied'
                ], 403);
            }

            // Remove sensitive data for non-admin users
            if (!$user->hasRole('admin')) {
                unset($feedback['ip_address'], $feedback['user_agent']);
            }

            return response()->json([
                'success' => true,
                'feedback' => $feedback
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get feedback details: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to get feedback details'
            ], 500);
        }
    }

    /**
     * Update feedback (for admins or to add additional info)
     */
    public function updateFeedback(Request $request, string $feedbackId): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'status' => 'sometimes|in:submitted,in_review,resolved,closed',
                'admin_response' => 'sometimes|nullable|string|max:1000',
                'priority' => 'sometimes|in:low,medium,high,critical',
                'additional_info' => 'sometimes|nullable|string|max:1000'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();
            $cacheKey = "feedback_{$feedbackId}";
            $feedback = Cache::get($cacheKey);

            if (!$feedback) {
                return response()->json([
                    'success' => false,
                    'error' => 'Feedback not found'
                ], 404);
            }

            // Check permissions
            $canUpdateStatus = $user->hasRole('admin') || $user->hasRole('support');
            $canAddInfo = $feedback['user_id'] === $user->id || $canUpdateStatus;

            if (!$canAddInfo) {
                return response()->json([
                    'success' => false,
                    'error' => 'Access denied'
                ], 403);
            }

            $updateData = [];

            // Only admins/support can update status and priority
            if ($canUpdateStatus) {
                if ($request->has('status')) {
                    $updateData['status'] = $request->status;
                }
                if ($request->has('priority')) {
                    $updateData['priority'] = $request->priority;
                }
                if ($request->has('admin_response')) {
                    $updateData['admin_response'] = $request->admin_response;
                    $updateData['admin_id'] = $user->id;
                    $updateData['admin_name'] = $user->name;
                    $updateData['admin_responded_at'] = now()->toISOString();
                }
            }

            // Users can add additional info to their own feedback
            if ($request->has('additional_info') && $feedback['user_id'] === $user->id) {
                $updateData['additional_info'] = $request->additional_info;
            }

            if (empty($updateData)) {
                return response()->json([
                    'success' => false,
                    'error' => 'No valid updates provided'
                ], 422);
            }

            // Update feedback
            $feedback = array_merge($feedback, $updateData);
            $feedback['updated_at'] = now()->toISOString();

            Cache::put($cacheKey, $feedback, now()->addDays(30));

            Log::info('Feedback updated', [
                'feedback_id' => $feedbackId,
                'updated_by' => $user->id,
                'updates' => array_keys($updateData)
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Feedback updated successfully',
                'feedback' => $feedback
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to update feedback: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to update feedback'
            ], 500);
        }
    }

    /**
     * Get feedback statistics
     */
    public function getFeedbackStats(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $userFeedbackKey = "user_feedback_{$user->id}";
            $feedbackIds = Cache::get($userFeedbackKey, []);

            $stats = [
                'total_feedback' => 0,
                'by_status' => [
                    'submitted' => 0,
                    'in_review' => 0,
                    'resolved' => 0,
                    'closed' => 0
                ],
                'by_type' => [
                    'bug_report' => 0,
                    'feature_request' => 0,
                    'general_feedback' => 0,
                    'rating' => 0,
                    'complaint' => 0,
                    'suggestion' => 0
                ],
                'average_rating' => 0,
                'response_rate' => 0,
                'last_feedback_date' => null
            ];

            $ratings = [];
            $responsesReceived = 0;
            $lastFeedbackDate = null;

            foreach ($feedbackIds as $feedbackId) {
                $cacheKey = "feedback_{$feedbackId}";
                $feedback = Cache::get($cacheKey);

                if ($feedback) {
                    $stats['total_feedback']++;

                    // Count by status
                    if (isset($stats['by_status'][$feedback['status']])) {
                        $stats['by_status'][$feedback['status']]++;
                    }

                    // Count by type
                    if (isset($stats['by_type'][$feedback['type']])) {
                        $stats['by_type'][$feedback['type']]++;
                    }

                    // Collect ratings
                    if ($feedback['rating']) {
                        $ratings[] = $feedback['rating'];
                    }

                    // Count responses
                    if (!empty($feedback['admin_response'])) {
                        $responsesReceived++;
                    }

                    // Track latest feedback date
                    $feedbackDate = Carbon::parse($feedback['submitted_at']);
                    if (!$lastFeedbackDate || $feedbackDate->gt($lastFeedbackDate)) {
                        $lastFeedbackDate = $feedbackDate;
                    }
                }
            }

            // Calculate averages
            if (!empty($ratings)) {
                $stats['average_rating'] = round(array_sum($ratings) / count($ratings), 2);
            }

            if ($stats['total_feedback'] > 0) {
                $stats['response_rate'] = round(($responsesReceived / $stats['total_feedback']) * 100, 2);
            }

            $stats['last_feedback_date'] = $lastFeedbackDate?->toISOString();

            return response()->json([
                'success' => true,
                'stats' => $stats
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get feedback stats: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to get feedback statistics'
            ], 500);
        }
    }

    /**
     * Delete feedback (soft delete)
     */
    public function deleteFeedback(Request $request, string $feedbackId): JsonResponse
    {
        try {
            $user = Auth::user();
            $cacheKey = "feedback_{$feedbackId}";
            $feedback = Cache::get($cacheKey);

            if (!$feedback) {
                return response()->json([
                    'success' => false,
                    'error' => 'Feedback not found'
                ], 404);
            }

            // Only allow deletion by owner or admin
            if ($feedback['user_id'] !== $user->id && !$user->hasRole('admin')) {
                return response()->json([
                    'success' => false,
                    'error' => 'Access denied'
                ], 403);
            }

            // Soft delete by marking as deleted
            $feedback['deleted_at'] = now()->toISOString();
            $feedback['deleted_by'] = $user->id;
            Cache::put($cacheKey, $feedback, now()->addDays(30));

            Log::info('Feedback deleted', [
                'feedback_id' => $feedbackId,
                'deleted_by' => $user->id
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Feedback deleted successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to delete feedback: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to delete feedback'
            ], 500);
        }
    }

    /**
     * Notify admins about high priority feedback
     */
    private function notifyAdmins(array $feedbackData): void
    {
        try {
            // In a real application, this would send notifications to admin users
            // For now, we'll just log it
            Log::info('High priority feedback notification', [
                'feedback_id' => $feedbackData['id'],
                'priority' => $feedbackData['priority'],
                'type' => $feedbackData['type'],
                'title' => $feedbackData['title']
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to notify admins: ' . $e->getMessage());
        }
    }
}
