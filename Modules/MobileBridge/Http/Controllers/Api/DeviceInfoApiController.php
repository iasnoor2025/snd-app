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

class DeviceInfoApiController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    /**
     * Register or update device information
     */
    public function registerDevice(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'device_id' => 'required|string|max:255',
                'device_type' => 'required|in:android,ios,web',
                'device_model' => 'nullable|string|max:255',
                'os_version' => 'nullable|string|max:50',
                'app_version' => 'required|string|max:50',
                'browser_info' => 'nullable|string|max:500',
                'screen_resolution' => 'nullable|string|max:50',
                'timezone' => 'nullable|string|max:100',
                'language' => 'nullable|string|max:10',
                'push_token' => 'nullable|string|max:500'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();
            $deviceId = $request->device_id;

            $deviceInfo = [
                'device_id' => $deviceId,
                'user_id' => $user->id,
                'device_type' => $request->device_type,
                'device_model' => $request->device_model,
                'os_version' => $request->os_version,
                'app_version' => $request->app_version,
                'browser_info' => $request->browser_info,
                'screen_resolution' => $request->screen_resolution,
                'timezone' => $request->timezone ?? 'UTC',
                'language' => $request->language ?? 'en',
                'push_token' => $request->push_token,
                'last_seen' => now()->toISOString(),
                'registered_at' => now()->toISOString(),
                'is_active' => true
            ];

            // Store device info in cache
            $cacheKey = "device_info_{$user->id}_{$deviceId}";
            Cache::put($cacheKey, $deviceInfo, now()->addDays(30));

            // Update user's device list
            $userDevicesKey = "user_devices_{$user->id}";
            $userDevices = Cache::get($userDevicesKey, []);

            // Remove existing device if present and add updated one
            $userDevices = array_filter($userDevices, fn($id) => $id !== $deviceId);
            $userDevices[] = $deviceId;

            Cache::put($userDevicesKey, $userDevices, now()->addDays(30));

            Log::info('Device registered', [
                'user_id' => $user->id,
                'device_id' => $deviceId,
                'device_type' => $request->device_type
            ]);

            return response()->json([
                'success' => true,
                'device_id' => $deviceId,
                'registered_at' => $deviceInfo['registered_at']
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to register device: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to register device'
            ], 500);
        }
    }

    /**
     * Update device last seen timestamp
     */
    public function updateLastSeen(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'device_id' => 'required|string|max:255'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();
            $deviceId = $request->device_id;
            $cacheKey = "device_info_{$user->id}_{$deviceId}";

            $deviceInfo = Cache::get($cacheKey);
            if (!$deviceInfo) {
                return response()->json([
                    'success' => false,
                    'error' => 'Device not found'
                ], 404);
            }

            $deviceInfo['last_seen'] = now()->toISOString();
            Cache::put($cacheKey, $deviceInfo, now()->addDays(30));

            return response()->json([
                'success' => true,
                'last_seen' => $deviceInfo['last_seen']
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to update device last seen: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to update device'
            ], 500);
        }
    }

    /**
     * Get device information
     */
    public function getDeviceInfo(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'device_id' => 'required|string|max:255'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();
            $deviceId = $request->device_id;
            $cacheKey = "device_info_{$user->id}_{$deviceId}";

            $deviceInfo = Cache::get($cacheKey);
            if (!$deviceInfo) {
                return response()->json([
                    'success' => false,
                    'error' => 'Device not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'device' => $deviceInfo
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get device info: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to get device info'
            ], 500);
        }
    }

    /**
     * Get all user devices
     */
    public function getUserDevices(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $userDevicesKey = "user_devices_{$user->id}";
            $deviceIds = Cache::get($userDevicesKey, []);

            $devices = [];
            foreach ($deviceIds as $deviceId) {
                $cacheKey = "device_info_{$user->id}_{$deviceId}";
                $deviceInfo = Cache::get($cacheKey);

                if ($deviceInfo) {
                    // Check if device is considered active (seen within last 7 days)
                    $lastSeen = Carbon::parse($deviceInfo['last_seen']);
                    $deviceInfo['is_active'] = $lastSeen->gt(now()->subDays(7));
                    $devices[] = $deviceInfo;
                }
            }

            // Sort by last seen (most recent first)
            usort($devices, function($a, $b) {
                return Carbon::parse($b['last_seen'])->gt(Carbon::parse($a['last_seen'])) ? 1 : -1;
            });

            return response()->json([
                'success' => true,
                'devices' => $devices,
                'count' => count($devices)
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get user devices: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to get user devices'
            ], 500);
        }
    }

    /**
     * Check for app version updates
     */
    public function checkVersion(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'current_version' => 'required|string|max:50',
                'device_type' => 'required|in:android,ios,web'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $currentVersion = $request->current_version;
            $deviceType = $request->device_type;

            // Get latest version info from cache or config
            $latestVersions = Cache::get('app_latest_versions', [
                'android' => '1.0.0',
                'ios' => '1.0.0',
                'web' => '1.0.0'
            ]);

            $latestVersion = $latestVersions[$deviceType] ?? '1.0.0';
            $updateRequired = version_compare($currentVersion, $latestVersion, '<');
            $forceUpdate = false;

            // Check for force update requirements
            $minVersions = Cache::get('app_min_versions', [
                'android' => '0.9.0',
                'ios' => '0.9.0',
                'web' => '0.9.0'
            ]);

            $minVersion = $minVersions[$deviceType] ?? '0.9.0';
            if (version_compare($currentVersion, $minVersion, '<')) {
                $forceUpdate = true;
            }

            $response = [
                'success' => true,
                'current_version' => $currentVersion,
                'latest_version' => $latestVersion,
                'update_available' => $updateRequired,
                'force_update' => $forceUpdate,
                'min_supported_version' => $minVersion
            ];

            // Add download URLs if update is available
            if ($updateRequired) {
                $downloadUrls = Cache::get('app_download_urls', [
                    'android' => 'https://play.google.com/store/apps/details?id=com.snd.rental',
                    'ios' => 'https://apps.apple.com/app/snd-rental/id123456789',
                    'web' => config('app.url')
                ]);

                $response['download_url'] = $downloadUrls[$deviceType] ?? null;
                $response['release_notes'] = Cache::get("release_notes_{$deviceType}_{$latestVersion}", 'Bug fixes and improvements');
            }

            return response()->json($response);

        } catch (\Exception $e) {
            Log::error('Failed to check version: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to check version'
            ], 500);
        }
    }

    /**
     * Deactivate a device
     */
    public function deactivateDevice(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'device_id' => 'required|string|max:255'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();
            $deviceId = $request->device_id;
            $cacheKey = "device_info_{$user->id}_{$deviceId}";

            $deviceInfo = Cache::get($cacheKey);
            if (!$deviceInfo) {
                return response()->json([
                    'success' => false,
                    'error' => 'Device not found'
                ], 404);
            }

            $deviceInfo['is_active'] = false;
            $deviceInfo['deactivated_at'] = now()->toISOString();
            Cache::put($cacheKey, $deviceInfo, now()->addDays(30));

            Log::info('Device deactivated', [
                'user_id' => $user->id,
                'device_id' => $deviceId
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Device deactivated successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to deactivate device: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to deactivate device'
            ], 500);
        }
    }

    /**
     * Get device statistics
     */
    public function getDeviceStats(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $userDevicesKey = "user_devices_{$user->id}";
            $deviceIds = Cache::get($userDevicesKey, []);

            $stats = [
                'total_devices' => 0,
                'active_devices' => 0,
                'device_types' => [
                    'android' => 0,
                    'ios' => 0,
                    'web' => 0
                ],
                'last_activity' => null
            ];

            $lastActivity = null;
            foreach ($deviceIds as $deviceId) {
                $cacheKey = "device_info_{$user->id}_{$deviceId}";
                $deviceInfo = Cache::get($cacheKey);

                if ($deviceInfo) {
                    $stats['total_devices']++;

                    // Check if device is active (seen within last 7 days)
                    $lastSeen = Carbon::parse($deviceInfo['last_seen']);
                    if ($lastSeen->gt(now()->subDays(7))) {
                        $stats['active_devices']++;
                    }

                    // Count device types
                    if (isset($stats['device_types'][$deviceInfo['device_type']])) {
                        $stats['device_types'][$deviceInfo['device_type']]++;
                    }

                    // Track latest activity
                    if (!$lastActivity || $lastSeen->gt(Carbon::parse($lastActivity))) {
                        $lastActivity = $deviceInfo['last_seen'];
                    }
                }
            }

            $stats['last_activity'] = $lastActivity;

            return response()->json([
                'success' => true,
                'stats' => $stats
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get device stats: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to get device stats'
            ], 500);
        }
    }
}
