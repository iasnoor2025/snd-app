<?php

namespace Modules\MobileBridge\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class MobileConfigApiController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    /**
     * Get mobile app configuration
     */
    public function getConfig(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();

            // Get base configuration
            $config = [
                'app' => [
                    'name' => config('app.name', 'SND Rental'),
                    'version' => config('app.version', '1.0.0'),
                    'build' => config('app.build', time()),
                    'environment' => config('app.env', 'production'),
                    'debug' => config('app.debug', false),
                    'timezone' => config('app.timezone', 'UTC'),
                    'locale' => config('app.locale', 'en'),
                    'fallback_locale' => config('app.fallback_locale', 'en')
                ],
                'api' => [
                    'base_url' => config('app.url'),
                    'version' => 'v1',
                    'timeout' => 30,
                    'retry_attempts' => 3,
                    'rate_limit' => [
                        'requests_per_minute' => 60,
                        'burst_limit' => 10
                    ]
                ],
                'features' => [
                    'offline_mode' => true,
                    'push_notifications' => true,
                    'biometric_auth' => true,
                    'dark_mode' => true,
                    'geolocation' => true,
                    'camera_access' => true,
                    'file_upload' => true,
                    'background_sync' => true
                ],
                'sync' => [
                    'interval_minutes' => 15,
                    'retry_attempts' => 3,
                    'batch_size' => 50,
                    'offline_storage_days' => 7,
                    'auto_sync_on_network' => true
                ],
                'cache' => [
                    'max_size_mb' => 100,
                    'image_cache_days' => 30,
                    'data_cache_hours' => 24,
                    'auto_cleanup' => true
                ],
                'security' => [
                    'session_timeout_minutes' => 120,
                    'auto_lock_minutes' => 5,
                    'require_pin' => false,
                    'biometric_fallback' => true,
                    'certificate_pinning' => config('app.env') === 'production'
                ],
                'ui' => [
                    'theme' => 'system', // light, dark, system
                    'primary_color' => '#3B82F6',
                    'accent_color' => '#10B981',
                    'font_size' => 'medium', // small, medium, large
                    'animations_enabled' => true,
                    'haptic_feedback' => true
                ],
                'notifications' => [
                    'enabled' => true,
                    'sound_enabled' => true,
                    'vibration_enabled' => true,
                    'badge_enabled' => true,
                    'categories' => [
                        'system' => true,
                        'reminders' => true,
                        'updates' => true,
                        'marketing' => false
                    ]
                ],
                'geofencing' => [
                    'enabled' => true,
                    'accuracy_meters' => 10,
                    'update_interval_seconds' => 30,
                    'background_updates' => true,
                    'battery_optimization' => true
                ]
            ];

            // Get user-specific overrides from cache
            $userConfigKey = "mobile_config_user_{$user->id}";
            $userConfig = Cache::get($userConfigKey, []);

            // Merge user-specific configuration
            if (!empty($userConfig)) {
                $config = array_merge_recursive($config, $userConfig);
            }

            // Get role-based configuration
            if ($user->hasRole('admin')) {
                $config['features']['admin_panel'] = true;
                $config['features']['user_management'] = true;
                $config['features']['system_logs'] = true;
            }

            if ($user->hasRole('manager')) {
                $config['features']['reports'] = true;
                $config['features']['team_management'] = true;
            }

            return response()->json([
                'success' => true,
                'config' => $config,
                'last_updated' => now()->toISOString()
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get mobile config: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to get configuration'
            ], 500);
        }
    }

    /**
     * Update user-specific mobile configuration
     */
    public function updateConfig(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'ui.theme' => 'nullable|in:light,dark,system',
                'ui.font_size' => 'nullable|in:small,medium,large',
                'ui.animations_enabled' => 'nullable|boolean',
                'ui.haptic_feedback' => 'nullable|boolean',
                'notifications.enabled' => 'nullable|boolean',
                'notifications.sound_enabled' => 'nullable|boolean',
                'notifications.vibration_enabled' => 'nullable|boolean',
                'notifications.categories' => 'nullable|array',
                'sync.interval_minutes' => 'nullable|integer|min:5|max:60',
                'sync.auto_sync_on_network' => 'nullable|boolean',
                'security.auto_lock_minutes' => 'nullable|integer|min:1|max:30',
                'security.require_pin' => 'nullable|boolean',
                'geofencing.enabled' => 'nullable|boolean',
                'geofencing.accuracy_meters' => 'nullable|integer|min:5|max:100'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();
            $userConfigKey = "mobile_config_user_{$user->id}";

            // Get existing user config
            $existingConfig = Cache::get($userConfigKey, []);

            // Update with new values
            $newConfig = array_merge_recursive($existingConfig, $request->only([
                'ui', 'notifications', 'sync', 'security', 'geofencing'
            ]));

            // Store updated configuration
            Cache::put($userConfigKey, $newConfig, now()->addDays(30));

            Log::info('Mobile config updated', [
                'user_id' => $user->id,
                'updated_keys' => array_keys($request->all())
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Configuration updated successfully',
                'updated_at' => now()->toISOString()
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to update mobile config: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to update configuration'
            ], 500);
        }
    }

    /**
     * Get app version information
     */
    public function getAppVersion(Request $request): JsonResponse
    {
        try {
            $versionInfo = [
                'current_version' => config('app.version', '1.0.0'),
                'build_number' => config('app.build', time()),
                'release_date' => config('app.release_date', now()->toDateString()),
                'minimum_supported_version' => config('app.min_version', '0.9.0'),
                'api_version' => 'v1',
                'changelog_url' => config('app.url') . '/changelog',
                'support_url' => config('app.url') . '/support'
            ];

            // Check if update is available
            $latestVersions = Cache::get('app_latest_versions', [
                'android' => config('app.version', '1.0.0'),
                'ios' => config('app.version', '1.0.0'),
                'web' => config('app.version', '1.0.0')
            ]);

            $deviceType = $request->header('X-Device-Type', 'web');
            $currentVersion = $request->header('X-App-Version', config('app.version', '1.0.0'));

            $latestVersion = $latestVersions[$deviceType] ?? config('app.version', '1.0.0');
            $updateAvailable = version_compare($currentVersion, $latestVersion, '<');

            $versionInfo['update_available'] = $updateAvailable;
            $versionInfo['latest_version'] = $latestVersion;

            if ($updateAvailable) {
                $downloadUrls = Cache::get('app_download_urls', [
                    'android' => 'https://play.google.com/store/apps/details?id=com.snd.rental',
                    'ios' => 'https://apps.apple.com/app/snd-rental/id123456789',
                    'web' => config('app.url')
                ]);

                $versionInfo['download_url'] = $downloadUrls[$deviceType] ?? config('app.url');
                $versionInfo['release_notes'] = Cache::get("release_notes_{$deviceType}_{$latestVersion}", 'Bug fixes and improvements');
            }

            return response()->json([
                'success' => true,
                'version_info' => $versionInfo
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get app version: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to get version information'
            ], 500);
        }
    }

    /**
     * Reset user configuration to defaults
     */
    public function resetConfig(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $userConfigKey = "mobile_config_user_{$user->id}";

            // Clear user-specific configuration
            Cache::forget($userConfigKey);

            Log::info('Mobile config reset to defaults', [
                'user_id' => $user->id
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Configuration reset to defaults',
                'reset_at' => now()->toISOString()
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to reset mobile config: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to reset configuration'
            ], 500);
        }
    }

    /**
     * Get feature flags for the mobile app
     */
    public function getFeatureFlags(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();

            // Base feature flags
            $featureFlags = [
                'new_dashboard' => true,
                'enhanced_search' => true,
                'bulk_operations' => true,
                'advanced_filters' => true,
                'export_functionality' => true,
                'real_time_updates' => true,
                'voice_commands' => false,
                'ar_features' => false,
                'beta_features' => false
            ];

            // Role-based feature flags
            if ($user->hasRole('admin')) {
                $featureFlags['beta_features'] = true;
                $featureFlags['system_diagnostics'] = true;
                $featureFlags['user_impersonation'] = true;
            }

            if ($user->hasRole('beta_tester')) {
                $featureFlags['beta_features'] = true;
                $featureFlags['experimental_ui'] = true;
            }

            // Get environment-specific flags
            if (config('app.env') === 'development') {
                $featureFlags['debug_panel'] = true;
                $featureFlags['performance_metrics'] = true;
            }

            return response()->json([
                'success' => true,
                'feature_flags' => $featureFlags,
                'last_updated' => now()->toISOString()
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get feature flags: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to get feature flags'
            ], 500);
        }
    }
}
