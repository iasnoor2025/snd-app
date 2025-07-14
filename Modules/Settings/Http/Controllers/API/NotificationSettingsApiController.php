<?php

namespace Modules\Settings\Http\Controllers\API;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Modules\Core\Http\Controllers\Controller;
use Modules\Settings\Services\NotificationSettingsService;

class NotificationSettingsApiController extends Controller
{
    public function __construct(
        private NotificationSettingsService $notificationSettingsService
    ) {}

    /**
     * Get notification settings
     */
    public function index(): JsonResponse
    {
        try {
            $settings = $this->notificationSettingsService->getSettings();

            return response()->json([
                'success' => true,
                'data' => $settings
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve notification settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update notification settings
     */
    public function update(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'email_notifications' => 'boolean',
                'sms_notifications' => 'boolean',
                'push_notifications' => 'boolean',
                'notification_frequency' => 'string|in:immediate,daily,weekly',
                'notification_types' => 'array',
                'notification_types.*' => 'string'
            ]);

            $settings = $this->notificationSettingsService->updateSettings($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Notification settings updated successfully',
                'data' => $settings
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update notification settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
