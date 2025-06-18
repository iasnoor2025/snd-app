<?php

namespace Modules\TimesheetManagement\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Modules\TimesheetManagement\Services\GeofencingService;

class GeofenceVerify
{
    protected GeofencingService $geofencingService;

    public function __construct(GeofencingService $geofencingService)
    {
        $this->geofencingService = $geofencingService;
    }

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        // Skip verification if anti-spoofing is disabled
        if (!config('mobile_geofencing.security.anti_spoofing.enabled', true)) {
            return $next($request);
        }

        $user = $request->user();
        if (!$user) {
            return response()->json([
                'error' => 'Authentication required',
                'code' => 'AUTH_REQUIRED'
            ], Response::HTTP_UNAUTHORIZED);
        }

        // Perform security checks
        $securityChecks = $this->performSecurityChecks($request);

        if (!$securityChecks['passed']) {
            return $this->handleSecurityViolation($request, $securityChecks);
        }

        // Verify device fingerprint
        $deviceCheck = $this->verifyDeviceFingerprint($request, $user);

        if (!$deviceCheck['valid']) {
            return $this->handleDeviceViolation($request, $deviceCheck);
        }

        // Check for suspicious patterns
        $patternCheck = $this->checkSuspiciousPatterns($request, $user);

        if (!$patternCheck['safe']) {
            return $this->handleSuspiciousActivity($request, $patternCheck);
        }

        // Add verification data to request
        $request->merge([
            'security_verification' => [
                'verified_at' => now(),
                'device_id' => $deviceCheck['device_id'],
                'security_score' => $this->calculateSecurityScore($securityChecks, $deviceCheck, $patternCheck),
                'checks_passed' => array_merge(
                    $securityChecks['checks'],
                    $deviceCheck['checks'],
                    $patternCheck['checks']
                ),
            ]
        ]);

        return $next($request);
    }

    /**
     * Perform various security checks.
     */
    protected function performSecurityChecks(Request $request): array
    {
        $checks = [];
        $issues = [];

        // Check for mock locations
        if (config('mobile_geofencing.security.anti_spoofing.check_mock_locations', true)) {
            $mockLocationCheck = $this->checkMockLocation($request);
            $checks['mock_location'] = $mockLocationCheck;

            if (!$mockLocationCheck) {
                $issues[] = 'Mock location detected';
            }
        }

        // Check for developer options
        if (config('mobile_geofencing.security.anti_spoofing.check_developer_options', true)) {
            $devOptionsCheck = $this->checkDeveloperOptions($request);
            $checks['developer_options'] = $devOptionsCheck;

            if (!$devOptionsCheck) {
                $issues[] = 'Developer options enabled';
            }
        }

        // Check for root/jailbreak
        if (config('mobile_geofencing.security.anti_spoofing.check_root_jailbreak', true)) {
            $rootCheck = $this->checkRootJailbreak($request);
            $checks['root_jailbreak'] = $rootCheck;

            if (!$rootCheck) {
                $issues[] = 'Rooted/jailbroken device detected';
            }
        }

        // Verify location consistency
        if (config('mobile_geofencing.security.anti_spoofing.verify_location_consistency', true)) {
            $consistencyCheck = $this->verifyLocationConsistency($request);
            $checks['location_consistency'] = $consistencyCheck;

            if (!$consistencyCheck) {
                $issues[] = 'Location data inconsistency detected';
            }
        }

        return [
            'passed' => empty($issues),
            'checks' => $checks,
            'issues' => $issues,
        ];
    }

    /**
     * Check for mock location usage.
     */
    protected function checkMockLocation(Request $request): bool
    {
        // Check for mock location indicators in headers
        $mockIndicators = [
            'X-Mock-Location',
            'X-Fake-GPS',
            'X-Location-Spoofed',
        ];

        foreach ($mockIndicators as $header) {
            if ($request->hasHeader($header)) {
                return false;
            }
        }

        // Check for mock location in request data
        if ($request->input('is_mock_location') === true ||
            $request->input('location.is_mock') === true) {
            return false;
        }

        // Check GPS provider information
        $provider = $request->input('gps.provider') ?? $request->input('location.provider');
        if ($provider && in_array(strtolower($provider), ['mock', 'fake', 'test'])) {
            return false;
        }

        return true;
    }

    /**
     * Check for developer options being enabled.
     */
    protected function checkDeveloperOptions(Request $request): bool
    {
        // Check for developer mode indicators
        $devIndicators = [
            'developer_options_enabled',
            'usb_debugging_enabled',
            'allow_mock_location',
        ];

        foreach ($devIndicators as $indicator) {
            if ($request->input($indicator) === true ||
                $request->input("device.{$indicator}") === true) {
                return false;
            }
        }

        return true;
    }

    /**
     * Check for rooted or jailbroken devices.
     */
    protected function checkRootJailbreak(Request $request): bool
    {
        // Check for root/jailbreak indicators
        $rootIndicators = [
            'is_rooted',
            'is_jailbroken',
            'has_superuser',
            'has_cydia',
        ];

        foreach ($rootIndicators as $indicator) {
            if ($request->input($indicator) === true ||
                $request->input("device.{$indicator}") === true) {
                return false;
            }
        }

        return true;
    }

    /**
     * Verify location data consistency.
     */
    protected function verifyLocationConsistency(Request $request): bool
    {
        $user = $request->user();
        $currentLocation = [
            'latitude' => $request->input('latitude'),
            'longitude' => $request->input('longitude'),
            'timestamp' => now(),
        ];

        // Get recent location history
        $cacheKey = "user_location_history_{$user->id}";
        $locationHistory = Cache::get($cacheKey, []);

        if (empty($locationHistory)) {
            // First location, store it
            Cache::put($cacheKey, [$currentLocation], 3600); // 1 hour
            return true;
        }

        // Check for impossible movement speeds
        $lastLocation = end($locationHistory);
        $distance = $this->calculateDistance(
            $lastLocation['latitude'],
            $lastLocation['longitude'],
            $currentLocation['latitude'],
            $currentLocation['longitude']
        );

        $timeDiff = $currentLocation['timestamp']->diffInSeconds($lastLocation['timestamp']);

        if ($timeDiff > 0) {
            $speed = ($distance * 1000) / $timeDiff; // meters per second
            $maxSpeed = 100; // 100 m/s (360 km/h) - reasonable maximum

            if ($speed > $maxSpeed) {
                Log::warning('Impossible movement speed detected', [
                    'user_id' => $user->id,
                    'speed' => $speed,
                    'distance' => $distance,
                    'time_diff' => $timeDiff,
                    'last_location' => $lastLocation,
                    'current_location' => $currentLocation,
                ]);
                return false;
            }
        }

        // Update location history (keep last 10 locations)
        $locationHistory[] = $currentLocation;
        $locationHistory = array_slice($locationHistory, -10);
        Cache::put($cacheKey, $locationHistory, 3600);

        return true;
    }

    /**
     * Verify device fingerprint.
     */
    protected function verifyDeviceFingerprint(Request $request, $user): array
    {
        if (!config('mobile_geofencing.security.device_fingerprinting.enabled', true)) {
            return ['valid' => true, 'device_id' => null, 'checks' => []];
        }

        $deviceId = $request->input('device_id') ?? $request->header('X-Device-ID');
        $deviceInfo = $this->extractDeviceInfo($request);

        if (!$deviceId) {
            return [
                'valid' => false,
                'device_id' => null,
                'checks' => ['device_id' => false],
                'reason' => 'Missing device ID',
            ];
        }

        // Check if device is registered for this user
        $cacheKey = "user_devices_{$user->id}";
        $userDevices = Cache::get($cacheKey, []);

        if (!isset($userDevices[$deviceId])) {
            // New device - check if user has reached device limit
            $maxDevices = config('mobile_geofencing.security.device_fingerprinting.max_devices_per_user', 3);

            if (count($userDevices) >= $maxDevices) {
                return [
                    'valid' => false,
                    'device_id' => $deviceId,
                    'checks' => ['device_limit' => false],
                    'reason' => 'Maximum number of devices exceeded',
                ];
            }

            // Register new device
            $userDevices[$deviceId] = [
                'registered_at' => now(),
                'device_info' => $deviceInfo,
                'last_seen' => now(),
            ];
        } else {
            // Existing device - check for changes
            if (config('mobile_geofencing.security.device_fingerprinting.track_device_changes', true)) {
                $storedInfo = $userDevices[$deviceId]['device_info'];
                $changes = $this->detectDeviceChanges($storedInfo, $deviceInfo);

                if (!empty($changes)) {
                    Log::warning('Device fingerprint changes detected', [
                        'user_id' => $user->id,
                        'device_id' => $deviceId,
                        'changes' => $changes,
                    ]);
                }
            }

            // Update last seen
            $userDevices[$deviceId]['last_seen'] = now();
        }

        // Update cache
        Cache::put($cacheKey, $userDevices, 86400 * 30); // 30 days

        return [
            'valid' => true,
            'device_id' => $deviceId,
            'checks' => ['device_registered' => true],
        ];
    }

    /**
     * Extract device information from request.
     */
    protected function extractDeviceInfo(Request $request): array
    {
        return [
            'user_agent' => $request->userAgent(),
            'platform' => $request->input('device.platform'),
            'model' => $request->input('device.model'),
            'os_version' => $request->input('device.os_version'),
            'app_version' => $request->input('device.app_version'),
            'screen_resolution' => $request->input('device.screen_resolution'),
            'timezone' => $request->input('device.timezone'),
        ];
    }

    /**
     * Detect changes in device fingerprint.
     */
    protected function detectDeviceChanges(array $stored, array $current): array
    {
        $changes = [];
        $criticalFields = ['platform', 'model', 'user_agent'];

        foreach ($criticalFields as $field) {
            if (isset($stored[$field]) && isset($current[$field]) &&
                $stored[$field] !== $current[$field]) {
                $changes[$field] = [
                    'old' => $stored[$field],
                    'new' => $current[$field],
                ];
            }
        }

        return $changes;
    }

    /**
     * Check for suspicious activity patterns.
     */
    protected function checkSuspiciousPatterns(Request $request, $user): array
    {
        $checks = [];
        $issues = [];

        // Check request frequency
        $frequencyCheck = $this->checkRequestFrequency($request, $user);
        $checks['request_frequency'] = $frequencyCheck;

        if (!$frequencyCheck) {
            $issues[] = 'Suspicious request frequency';
        }

        // Check for automation indicators
        $automationCheck = $this->checkAutomationIndicators($request);
        $checks['automation'] = $automationCheck;

        if (!$automationCheck) {
            $issues[] = 'Automation indicators detected';
        }

        return [
            'safe' => empty($issues),
            'checks' => $checks,
            'issues' => $issues,
        ];
    }

    /**
     * Check request frequency for rate limiting.
     */
    protected function checkRequestFrequency(Request $request, $user): bool
    {
        $cacheKey = "request_frequency_{$user->id}";
        $requests = Cache::get($cacheKey, []);

        $now = time();
        $window = 60; // 1 minute window
        $maxRequests = config('mobile_geofencing.performance.rate_limiting.requests_per_minute', 60);

        // Remove old requests
        $requests = array_filter($requests, function($timestamp) use ($now, $window) {
            return ($now - $timestamp) < $window;
        });

        // Add current request
        $requests[] = $now;

        // Update cache
        Cache::put($cacheKey, $requests, $window);

        return count($requests) <= $maxRequests;
    }

    /**
     * Check for automation indicators.
     */
    protected function checkAutomationIndicators(Request $request): bool
    {
        $userAgent = strtolower($request->userAgent());

        // Check for bot/automation user agents
        $botIndicators = [
            'bot', 'crawler', 'spider', 'scraper', 'automation',
            'selenium', 'phantomjs', 'headless', 'curl', 'wget'
        ];

        foreach ($botIndicators as $indicator) {
            if (strpos($userAgent, $indicator) !== false) {
                return false;
            }
        }

        return true;
    }

    /**
     * Calculate security score based on all checks.
     */
    protected function calculateSecurityScore(array $securityChecks, array $deviceCheck, array $patternCheck): int
    {
        $score = 100;

        // Deduct points for failed security checks
        foreach ($securityChecks['issues'] as $issue) {
            $score -= 20;
        }

        // Deduct points for device issues
        if (!$deviceCheck['valid']) {
            $score -= 30;
        }

        // Deduct points for suspicious patterns
        foreach ($patternCheck['issues'] as $issue) {
            $score -= 15;
        }

        return max(0, $score);
    }

    /**
     * Handle security violations.
     */
    protected function handleSecurityViolation(Request $request, array $securityChecks)
    {
        Log::warning('Security violation detected', [
            'user_id' => $request->user()->id,
            'issues' => $securityChecks['issues'],
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'error' => 'Security verification failed',
            'code' => 'SECURITY_VIOLATION',
            'message' => 'Your device or location data failed security verification.',
            'issues' => $securityChecks['issues'],
        ], Response::HTTP_FORBIDDEN);
    }

    /**
     * Handle device violations.
     */
    protected function handleDeviceViolation(Request $request, array $deviceCheck)
    {
        Log::warning('Device verification failed', [
            'user_id' => $request->user()->id,
            'device_id' => $deviceCheck['device_id'],
            'reason' => $deviceCheck['reason'],
            'ip' => $request->ip(),
        ]);

        return response()->json([
            'error' => 'Device verification failed',
            'code' => 'DEVICE_VIOLATION',
            'message' => $deviceCheck['reason'],
        ], Response::HTTP_FORBIDDEN);
    }

    /**
     * Handle suspicious activity.
     */
    protected function handleSuspiciousActivity(Request $request, array $patternCheck)
    {
        Log::warning('Suspicious activity detected', [
            'user_id' => $request->user()->id,
            'issues' => $patternCheck['issues'],
            'ip' => $request->ip(),
        ]);

        return response()->json([
            'error' => 'Suspicious activity detected',
            'code' => 'SUSPICIOUS_ACTIVITY',
            'message' => 'Unusual activity patterns detected.',
            'issues' => $patternCheck['issues'],
        ], Response::HTTP_TOO_MANY_REQUESTS);
    }

    /**
     * Calculate distance between two coordinates.
     */
    protected function calculateDistance($lat1, $lon1, $lat2, $lon2): float
    {
        $earthRadius = 6371; // Earth's radius in kilometers

        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat/2) * sin($dLat/2) + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLon/2) * sin($dLon/2);
        $c = 2 * atan2(sqrt($a), sqrt(1-$a));

        return $earthRadius * $c;
    }
}
