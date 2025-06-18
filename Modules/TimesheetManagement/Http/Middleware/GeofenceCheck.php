<?php

namespace Modules\TimesheetManagement\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use Modules\TimesheetManagement\Services\GeofencingService;
use Modules\TimesheetManagement\Models\GeofenceZone;

class GeofenceCheck
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
     * @param  string|null  $strictMode
     * @return mixed
     */
    public function handle(Request $request, Closure $next, ?string $strictMode = null)
    {
        // Skip geofence check if disabled in config
        if (!config('mobile_geofencing.violations.enabled', true)) {
            return $next($request);
        }

        // Skip for non-mobile requests unless explicitly required
        if (!$this->isMobileRequest($request) && $strictMode !== 'always') {
            return $next($request);
        }

        // Get location data from request
        $locationData = $this->extractLocationData($request);

        if (!$locationData) {
            return $this->handleMissingLocation($request, $next, $strictMode);
        }

        // Validate location data
        $validation = $this->validateLocationData($locationData);
        if (!$validation['valid']) {
            return $this->handleInvalidLocation($request, $validation['errors'], $strictMode);
        }

        // Check geofence compliance
        $user = $request->user();
        $complianceResult = $this->geofencingService->validateLocation(
            $locationData['latitude'],
            $locationData['longitude'],
            $user,
            $request->input('project_id')
        );

        // Handle geofence violations
        if (!$complianceResult['compliant']) {
            return $this->handleGeofenceViolation($request, $complianceResult, $strictMode);
        }

        // Add geofence data to request for downstream use
        $request->merge([
            'geofence_data' => [
                'location' => $locationData,
                'compliance' => $complianceResult,
                'zones' => $complianceResult['zones'] ?? [],
                'verified_at' => now(),
            ]
        ]);

        // Log successful geofence check
        Log::info('Geofence check passed', [
            'user_id' => $user->id,
            'location' => $locationData,
            'zones' => count($complianceResult['zones'] ?? []),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return $next($request);
    }

    /**
     * Check if the request is from a mobile device.
     */
    protected function isMobileRequest(Request $request): bool
    {
        // Check for mobile-specific headers
        if ($request->hasHeader('X-Mobile-App')) {
            return true;
        }

        // Check for mobile user agent patterns
        $userAgent = strtolower($request->userAgent());
        $mobilePatterns = [
            'mobile', 'android', 'iphone', 'ipad', 'ipod',
            'blackberry', 'windows phone', 'opera mini'
        ];

        foreach ($mobilePatterns as $pattern) {
            if (strpos($userAgent, $pattern) !== false) {
                return true;
            }
        }

        // Check for API endpoints that are mobile-specific
        $mobileEndpoints = [
            '/api/mobile/',
            '/api/timesheet/mobile/',
            '/api/geofence/mobile/'
        ];

        foreach ($mobileEndpoints as $endpoint) {
            if (strpos($request->getPathInfo(), $endpoint) !== false) {
                return true;
            }
        }

        return false;
    }

    /**
     * Extract location data from the request.
     */
    protected function extractLocationData(Request $request): ?array
    {
        // Try different location data sources
        $sources = [
            // Direct location parameters
            ['latitude', 'longitude'],
            ['lat', 'lng'],
            ['lat', 'lon'],

            // Nested location object
            ['location.latitude', 'location.longitude'],
            ['location.lat', 'location.lng'],

            // GPS data
            ['gps.latitude', 'gps.longitude'],
            ['gps_data.latitude', 'gps_data.longitude'],
        ];

        foreach ($sources as [$latKey, $lngKey]) {
            $latitude = $request->input($latKey);
            $longitude = $request->input($lngKey);

            if ($latitude !== null && $longitude !== null) {
                return [
                    'latitude' => (float) $latitude,
                    'longitude' => (float) $longitude,
                    'accuracy' => $request->input('accuracy') ?? $request->input('gps.accuracy'),
                    'timestamp' => $request->input('timestamp') ?? $request->input('gps.timestamp'),
                    'altitude' => $request->input('altitude') ?? $request->input('gps.altitude'),
                    'heading' => $request->input('heading') ?? $request->input('gps.heading'),
                    'speed' => $request->input('speed') ?? $request->input('gps.speed'),
                ];
            }
        }

        return null;
    }

    /**
     * Validate location data quality and authenticity.
     */
    protected function validateLocationData(array $locationData): array
    {
        $errors = [];

        // Validate coordinates
        if (!$this->isValidLatitude($locationData['latitude'])) {
            $errors[] = 'Invalid latitude value';
        }

        if (!$this->isValidLongitude($locationData['longitude'])) {
            $errors[] = 'Invalid longitude value';
        }

        // Validate accuracy
        $accuracy = $locationData['accuracy'] ?? null;
        if ($accuracy !== null) {
            $minAccuracy = config('mobile_geofencing.gps.min_accuracy', 50);
            $maxAccuracy = config('mobile_geofencing.gps.max_accuracy', 500);

            if ($accuracy < $minAccuracy || $accuracy > $maxAccuracy) {
                $errors[] = "GPS accuracy out of acceptable range ({$minAccuracy}-{$maxAccuracy}m)";
            }
        }

        // Validate timestamp
        $timestamp = $locationData['timestamp'] ?? null;
        if ($timestamp !== null) {
            $maxAge = config('mobile_geofencing.gps.max_location_age', 300);
            $locationTime = is_numeric($timestamp) ? $timestamp : strtotime($timestamp);

            if (time() - $locationTime > $maxAge) {
                $errors[] = 'Location data is too old';
            }
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors,
        ];
    }

    /**
     * Handle missing location data.
     */
    protected function handleMissingLocation(Request $request, Closure $next, ?string $strictMode)
    {
        if ($strictMode === 'strict') {
            return response()->json([
                'error' => 'Location data is required for this operation',
                'code' => 'LOCATION_REQUIRED',
                'message' => 'Please enable location services and try again.',
            ], Response::HTTP_BAD_REQUEST);
        }

        // Log warning for missing location
        Log::warning('Geofence check skipped - missing location data', [
            'user_id' => $request->user()?->id,
            'endpoint' => $request->getPathInfo(),
            'ip' => $request->ip(),
        ]);

        return $next($request);
    }

    /**
     * Handle invalid location data.
     */
    protected function handleInvalidLocation(Request $request, array $errors, ?string $strictMode)
    {
        Log::warning('Invalid location data provided', [
            'user_id' => $request->user()?->id,
            'errors' => $errors,
            'location_data' => $request->only(['latitude', 'longitude', 'accuracy', 'timestamp']),
            'ip' => $request->ip(),
        ]);

        if ($strictMode === 'strict') {
            return response()->json([
                'error' => 'Invalid location data',
                'code' => 'INVALID_LOCATION',
                'message' => 'The provided location data is invalid or inaccurate.',
                'details' => $errors,
            ], Response::HTTP_BAD_REQUEST);
        }

        // Continue with warning in non-strict mode
        return response()->json([
            'warning' => 'Location data quality issues detected',
            'issues' => $errors,
        ], Response::HTTP_OK);
    }

    /**
     * Handle geofence violations.
     */
    protected function handleGeofenceViolation(Request $request, array $complianceResult, ?string $strictMode)
    {
        $user = $request->user();

        Log::warning('Geofence violation detected', [
            'user_id' => $user->id,
            'violations' => $complianceResult['violations'] ?? [],
            'location' => $complianceResult['location'] ?? [],
            'ip' => $request->ip(),
        ]);

        // In strict mode, block the request
        if ($strictMode === 'strict') {
            return response()->json([
                'error' => 'Geofence violation detected',
                'code' => 'GEOFENCE_VIOLATION',
                'message' => 'You are not in an authorized location for this operation.',
                'violations' => $complianceResult['violations'] ?? [],
                'suggested_zones' => $this->getSuggestedZones($user),
            ], Response::HTTP_FORBIDDEN);
        }

        // In warning mode, allow but flag the request
        $request->merge([
            'geofence_warning' => true,
            'geofence_violations' => $complianceResult['violations'] ?? [],
        ]);

        return response()->json([
            'warning' => 'Geofence compliance issue',
            'message' => 'Your current location may not be authorized for this operation.',
            'violations' => $complianceResult['violations'] ?? [],
        ], Response::HTTP_OK);
    }

    /**
     * Get suggested zones for the user.
     */
    protected function getSuggestedZones($user): array
    {
        return GeofenceZone::where('is_active', true)
            ->where(function ($query) use ($user) {
                $query->whereNull('project_id')
                      ->orWhereIn('project_id', $user->projects->pluck('id'));
            })
            ->select(['id', 'name', 'zone_type', 'center_latitude', 'center_longitude', 'radius'])
            ->limit(5)
            ->get()
            ->toArray();
    }

    /**
     * Validate latitude value.
     */
    protected function isValidLatitude($latitude): bool
    {
        return is_numeric($latitude) && $latitude >= -90 && $latitude <= 90;
    }

    /**
     * Validate longitude value.
     */
    protected function isValidLongitude($longitude): bool
    {
        return is_numeric($longitude) && $longitude >= -180 && $longitude <= 180;
    }
}
