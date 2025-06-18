<?php

namespace Modules\TimesheetManagement\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Laravel\Sanctum\PersonalAccessToken;

class MobileAuth
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        // Verify mobile app authentication
        $authResult = $this->verifyMobileAuth($request);

        if (!$authResult['valid']) {
            return $this->handleAuthFailure($request, $authResult);
        }

        // Verify app version compatibility
        $versionCheck = $this->checkAppVersion($request);

        if (!$versionCheck['compatible']) {
            return $this->handleVersionMismatch($request, $versionCheck);
        }

        // Check device requirements
        $deviceCheck = $this->checkDeviceRequirements($request);

        if (!$deviceCheck['meets_requirements']) {
            return $this->handleDeviceRequirements($request, $deviceCheck);
        }

        // Add mobile context to request
        $request->merge([
            'mobile_context' => [
                'authenticated_at' => now(),
                'app_version' => $versionCheck['version'],
                'platform' => $deviceCheck['platform'],
                'device_id' => $authResult['device_id'],
                'session_id' => $authResult['session_id'],
            ]
        ]);

        // Log mobile access
        $this->logMobileAccess($request, $authResult);

        return $next($request);
    }

    /**
     * Verify mobile app authentication.
     */
    protected function verifyMobileAuth(Request $request): array
    {
        // Check for mobile app header
        if (!$request->hasHeader('X-Mobile-App')) {
            return [
                'valid' => false,
                'reason' => 'Missing mobile app header',
                'code' => 'MISSING_MOBILE_HEADER'
            ];
        }

        // Verify API token
        $token = $request->bearerToken();
        if (!$token) {
            return [
                'valid' => false,
                'reason' => 'Missing authentication token',
                'code' => 'MISSING_TOKEN'
            ];
        }

        // Validate token using Sanctum
        $accessToken = PersonalAccessToken::findToken($token);
        if (!$accessToken) {
            return [
                'valid' => false,
                'reason' => 'Invalid authentication token',
                'code' => 'INVALID_TOKEN'
            ];
        }

        // Check if token is for mobile access
        if (!$this->isMobileToken($accessToken)) {
            return [
                'valid' => false,
                'reason' => 'Token not authorized for mobile access',
                'code' => 'INVALID_TOKEN_TYPE'
            ];
        }

        // Check token expiration
        if ($this->isTokenExpired($accessToken)) {
            return [
                'valid' => false,
                'reason' => 'Authentication token has expired',
                'code' => 'TOKEN_EXPIRED'
            ];
        }

        // Get device and session information
        $deviceId = $request->header('X-Device-ID') ?? $request->input('device_id');
        $sessionId = $request->header('X-Session-ID') ?? $this->generateSessionId($accessToken, $deviceId);

        return [
            'valid' => true,
            'user_id' => $accessToken->tokenable_id,
            'token_id' => $accessToken->id,
            'device_id' => $deviceId,
            'session_id' => $sessionId,
            'abilities' => $accessToken->abilities,
        ];
    }

    /**
     * Check if the token is for mobile access.
     */
    protected function isMobileToken(PersonalAccessToken $token): bool
    {
        // Check token name for mobile indicators
        $mobileTokenNames = ['mobile', 'app', 'ios', 'android'];
        $tokenName = strtolower($token->name);

        foreach ($mobileTokenNames as $indicator) {
            if (strpos($tokenName, $indicator) !== false) {
                return true;
            }
        }

        // Check token abilities for mobile permissions
        $mobileAbilities = ['mobile:access', 'timesheet:mobile', 'geofence:access'];

        foreach ($mobileAbilities as $ability) {
            if (in_array($ability, $token->abilities)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if the token has expired.
     */
    protected function isTokenExpired(PersonalAccessToken $token): bool
    {
        if (!$token->expires_at) {
            return false; // No expiration set
        }

        return $token->expires_at->isPast();
    }

    /**
     * Generate a session ID for the mobile session.
     */
    protected function generateSessionId(PersonalAccessToken $token, ?string $deviceId): string
    {
        return hash('sha256', $token->id . '_' . ($deviceId ?? 'unknown') . '_' . time());
    }

    /**
     * Check app version compatibility.
     */
    protected function checkAppVersion(Request $request): array
    {
        $appVersion = $request->header('X-App-Version') ?? $request->input('app_version');

        if (!$appVersion) {
            return [
                'compatible' => false,
                'reason' => 'App version not provided',
                'code' => 'MISSING_VERSION'
            ];
        }

        $minVersion = config('mobile_geofencing.mobile.min_app_version', '1.0.0');

        if (version_compare($appVersion, $minVersion, '<')) {
            return [
                'compatible' => false,
                'version' => $appVersion,
                'min_version' => $minVersion,
                'reason' => 'App version is outdated',
                'code' => 'VERSION_OUTDATED'
            ];
        }

        return [
            'compatible' => true,
            'version' => $appVersion,
            'min_version' => $minVersion,
        ];
    }

    /**
     * Check device requirements.
     */
    protected function checkDeviceRequirements(Request $request): array
    {
        $platform = $request->header('X-Platform') ?? $request->input('platform');
        $deviceInfo = $this->extractDeviceInfo($request);

        $requirements = config('mobile_geofencing.mobile.device_requirements', []);
        $issues = [];

        // Check platform support
        $supportedPlatforms = config('mobile_geofencing.mobile.supported_platforms', ['ios', 'android', 'web']);
        if ($platform && !in_array(strtolower($platform), $supportedPlatforms)) {
            $issues[] = "Platform '{$platform}' is not supported";
        }

        // Check GPS requirement
        if ($requirements['gps_required'] ?? true) {
            $hasGPS = $request->input('device.has_gps') ?? $request->input('capabilities.gps');
            if ($hasGPS === false) {
                $issues[] = 'GPS capability is required';
            }
        }

        // Check storage requirement
        $minStorage = $requirements['min_storage_mb'] ?? 50;
        $availableStorage = $request->input('device.available_storage_mb');
        if ($availableStorage !== null && $availableStorage < $minStorage) {
            $issues[] = "Insufficient storage space (minimum {$minStorage}MB required)";
        }

        // Check network requirement for online features
        $networkRequired = $requirements['network_required'] ?? false;
        if ($networkRequired) {
            $hasNetwork = $request->input('device.has_network') ?? true; // Assume true if not specified
            if (!$hasNetwork) {
                $issues[] = 'Network connection is required';
            }
        }

        return [
            'meets_requirements' => empty($issues),
            'platform' => $platform,
            'device_info' => $deviceInfo,
            'issues' => $issues,
        ];
    }

    /**
     * Extract device information from request.
     */
    protected function extractDeviceInfo(Request $request): array
    {
        return [
            'platform' => $request->header('X-Platform') ?? $request->input('platform'),
            'os_version' => $request->header('X-OS-Version') ?? $request->input('os_version'),
            'device_model' => $request->header('X-Device-Model') ?? $request->input('device_model'),
            'app_version' => $request->header('X-App-Version') ?? $request->input('app_version'),
            'device_id' => $request->header('X-Device-ID') ?? $request->input('device_id'),
            'user_agent' => $request->userAgent(),
            'screen_resolution' => $request->input('device.screen_resolution'),
            'timezone' => $request->input('device.timezone'),
            'language' => $request->input('device.language'),
            'has_gps' => $request->input('device.has_gps'),
            'has_camera' => $request->input('device.has_camera'),
            'has_network' => $request->input('device.has_network'),
            'battery_level' => $request->input('device.battery_level'),
            'available_storage_mb' => $request->input('device.available_storage_mb'),
        ];
    }

    /**
     * Log mobile access for audit purposes.
     */
    protected function logMobileAccess(Request $request, array $authResult): void
    {
        if (!config('mobile_geofencing.security.audit_logging.enabled', true)) {
            return;
        }

        Log::info('Mobile app access', [
            'user_id' => $authResult['user_id'],
            'device_id' => $authResult['device_id'],
            'session_id' => $authResult['session_id'],
            'endpoint' => $request->getPathInfo(),
            'method' => $request->getMethod(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'app_version' => $request->header('X-App-Version'),
            'platform' => $request->header('X-Platform'),
            'timestamp' => now(),
        ]);
    }

    /**
     * Handle authentication failure.
     */
    protected function handleAuthFailure(Request $request, array $authResult)
    {
        Log::warning('Mobile authentication failed', [
            'reason' => $authResult['reason'],
            'code' => $authResult['code'],
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'endpoint' => $request->getPathInfo(),
        ]);

        return response()->json([
            'error' => 'Authentication failed',
            'code' => $authResult['code'],
            'message' => $authResult['reason'],
        ], Response::HTTP_UNAUTHORIZED);
    }

    /**
     * Handle app version mismatch.
     */
    protected function handleVersionMismatch(Request $request, array $versionCheck)
    {
        Log::warning('App version mismatch', [
            'current_version' => $versionCheck['version'] ?? 'unknown',
            'min_version' => $versionCheck['min_version'],
            'user_id' => $request->user()?->id,
            'ip' => $request->ip(),
        ]);

        return response()->json([
            'error' => 'App version outdated',
            'code' => $versionCheck['code'],
            'message' => $versionCheck['reason'],
            'current_version' => $versionCheck['version'] ?? null,
            'min_version' => $versionCheck['min_version'],
            'update_required' => true,
            'download_url' => config('mobile_geofencing.mobile.app_download_url'),
        ], Response::HTTP_UPGRADE_REQUIRED);
    }

    /**
     * Handle device requirements not met.
     */
    protected function handleDeviceRequirements(Request $request, array $deviceCheck)
    {
        Log::warning('Device requirements not met', [
            'issues' => $deviceCheck['issues'],
            'platform' => $deviceCheck['platform'],
            'user_id' => $request->user()?->id,
            'ip' => $request->ip(),
        ]);

        return response()->json([
            'error' => 'Device requirements not met',
            'code' => 'DEVICE_REQUIREMENTS_NOT_MET',
            'message' => 'Your device does not meet the minimum requirements for this app.',
            'issues' => $deviceCheck['issues'],
            'requirements' => config('mobile_geofencing.mobile.device_requirements'),
        ], Response::HTTP_BAD_REQUEST);
    }
}
