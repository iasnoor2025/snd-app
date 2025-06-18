<?php

namespace Modules\Core\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Core\Services\SystemSettingsService;
use Modules\Core\Http\Requests\UpdateSystemSettingsRequest;

class SystemSettingsController extends Controller
{
    public function __construct(
        private SystemSettingsService $systemSettingsService
    ) {}

    /**
     * Display the system settings page
     */
    public function index(): Response
    {
        $settings = $this->systemSettingsService->getAllSettings();

        return Inertia::render('Core/SystemSettings/Index', [
            'settings' => $settings,
            'categories' => $this->getSettingsCategories(),
        ]);
    }

    /**
     * Update system settings
     */
    public function update(UpdateSystemSettingsRequest $request): JsonResponse
    {
        try {
            $settings = $request->validated();

            $this->systemSettingsService->updateSettings($settings);

            // Clear settings cache
            Cache::forget('system_settings');

            return response()->json([
                'message' => 'System settings updated successfully',
                'settings' => $this->systemSettingsService->getAllSettings()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update system settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reset settings to default values
     */
    public function reset(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'category' => 'sometimes|string|in:general,security,performance,notifications,maintenance'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Invalid category specified',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $category = $request->input('category');

            if ($category) {
                $this->systemSettingsService->resetCategoryToDefaults($category);
                $message = "Settings for {$category} category reset to defaults";
            } else {
                $this->systemSettingsService->resetAllToDefaults();
                $message = 'All system settings reset to defaults';
            }

            // Clear settings cache
            Cache::forget('system_settings');

            return response()->json([
                'message' => $message,
                'settings' => $this->systemSettingsService->getAllSettings()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to reset system settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export system settings
     */
    public function export(): JsonResponse
    {
        try {
            $settings = $this->systemSettingsService->exportSettings();

            return response()->json([
                'settings' => $settings,
                'exported_at' => now()->toISOString(),
                'version' => config('app.version', '1.0.0')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to export system settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Import system settings
     */
    public function import(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'settings' => 'required|array',
            'overwrite_existing' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Invalid import data',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $settings = $request->input('settings');
            $overwrite = $request->boolean('overwrite_existing', false);

            $result = $this->systemSettingsService->importSettings($settings, $overwrite);

            // Clear settings cache
            Cache::forget('system_settings');

            return response()->json([
                'message' => 'System settings imported successfully',
                'imported_count' => $result['imported_count'],
                'skipped_count' => $result['skipped_count'],
                'settings' => $this->systemSettingsService->getAllSettings()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to import system settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get system health status
     */
    public function health(): JsonResponse
    {
        try {
            $health = $this->systemSettingsService->getSystemHealth();

            return response()->json($health);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to get system health',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get settings categories configuration
     */
    private function getSettingsCategories(): array
    {
        return [
            'general' => [
                'label' => 'General Settings',
                'description' => 'Basic application configuration',
                'icon' => 'Settings',
                'fields' => [
                    'app_name',
                    'app_description',
                    'default_timezone',
                    'default_language',
                    'date_format',
                    'time_format',
                    'currency',
                    'decimal_places'
                ]
            ],
            'security' => [
                'label' => 'Security Settings',
                'description' => 'Security and authentication configuration',
                'icon' => 'Shield',
                'fields' => [
                    'session_timeout',
                    'password_min_length',
                    'password_require_uppercase',
                    'password_require_lowercase',
                    'password_require_numbers',
                    'password_require_symbols',
                    'max_login_attempts',
                    'lockout_duration',
                    'two_factor_enabled'
                ]
            ],
            'performance' => [
                'label' => 'Performance Settings',
                'description' => 'System performance and optimization',
                'icon' => 'Zap',
                'fields' => [
                    'cache_enabled',
                    'cache_ttl',
                    'query_cache_enabled',
                    'compression_enabled',
                    'lazy_loading_enabled',
                    'pagination_size',
                    'max_file_upload_size',
                    'image_optimization_enabled'
                ]
            ],
            'notifications' => [
                'label' => 'Notification Settings',
                'description' => 'System notification configuration',
                'icon' => 'Bell',
                'fields' => [
                    'email_notifications_enabled',
                    'sms_notifications_enabled',
                    'push_notifications_enabled',
                    'notification_queue_enabled',
                    'digest_notifications_enabled',
                    'digest_frequency',
                    'notification_retention_days'
                ]
            ],
            'maintenance' => [
                'label' => 'Maintenance Settings',
                'description' => 'System maintenance and cleanup',
                'icon' => 'Wrench',
                'fields' => [
                    'maintenance_mode_enabled',
                    'maintenance_message',
                    'auto_backup_enabled',
                    'backup_frequency',
                    'backup_retention_days',
                    'log_cleanup_enabled',
                    'log_retention_days',
                    'temp_file_cleanup_enabled'
                ]
            ]
        ];
    }
}
