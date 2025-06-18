<?php

namespace Modules\TimesheetManagement\Services;

use Modules\TimesheetManagement\Domain\Models\GeofenceZone;
use Modules\TimesheetManagement\Domain\Models\Timesheet;
use Modules\TimesheetManagement\Events\GeofenceViolationDetected;
use Modules\Core\Domain\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Collection;

class GeofencingService
{
    /**
     * Validate location against geofence zones
     */
    public function validateLocation(
        float $latitude,
        float $longitude,
        ?int $projectId = null,
        ?int $employeeId = null
    ): array {
        $zones = $this->getApplicableZones($projectId);
        $violations = [];
        $isWithinAnyZone = false;
        $closestZone = null;
        $minDistance = PHP_FLOAT_MAX;

        foreach ($zones as $zone) {
            $isWithin = $zone->isLocationWithinZone($latitude, $longitude);
            $distance = $zone->getDistanceFromZone($latitude, $longitude);

            if ($isWithin) {
                $isWithinAnyZone = true;
            }

            if ($distance < $minDistance) {
                $minDistance = $distance;
                $closestZone = $zone;
            }

            // Check for violations
            if ($zone->strict_enforcement && !$isWithin) {
                $violations[] = [
                    'zone_id' => $zone->id,
                    'zone_name' => $zone->name,
                    'distance' => $distance,
                    'severity' => 'strict',
                    'message' => "Location is outside strict enforcement zone '{$zone->name}' by {$distance}m"
                ];
            } elseif (!$isWithin && $distance > ($zone->radius_meters + $zone->buffer_meters)) {
                $violations[] = [
                    'zone_id' => $zone->id,
                    'zone_name' => $zone->name,
                    'distance' => $distance,
                    'severity' => 'warning',
                    'message' => "Location is outside zone '{$zone->name}' by {$distance}m"
                ];
            }
        }

        $result = [
            'is_valid' => $isWithinAnyZone || empty($violations),
            'is_within_any_zone' => $isWithinAnyZone,
            'violations' => $violations,
            'closest_zone' => $closestZone ? [
                'id' => $closestZone->id,
                'name' => $closestZone->name,
                'distance' => $minDistance
            ] : null,
            'total_zones_checked' => $zones->count()
        ];

        // Log violations if any
        if (!empty($violations)) {
            $this->logGeofenceViolation($latitude, $longitude, $violations, $employeeId, $projectId);
        }

        return $result;
    }

    /**
     * Get applicable geofence zones for a project
     */
    public function getApplicableZones(?int $projectId = null): Collection
    {
        return GeofenceZone::active()
            ->when($projectId, function ($query, $projectId) {
                $query->where(function ($q) use ($projectId) {
                    $q->where('project_id', $projectId)
                      ->orWhereNull('project_id');
                });
            }, function ($query) {
                // If no project specified, get global zones only
                $query->whereNull('project_id');
            })
            ->get();
    }

    /**
     * Create a new geofence zone
     */
    public function createZone(array $data): GeofenceZone
    {
        // Validate coordinates
        $this->validateCoordinates($data['center_latitude'], $data['center_longitude']);

        if (isset($data['polygon_coordinates'])) {
            $this->validatePolygonCoordinates($data['polygon_coordinates']);
        }

        return GeofenceZone::create($data);
    }

    /**
     * Update an existing geofence zone
     */
    public function updateZone(GeofenceZone $zone, array $data): GeofenceZone
    {
        if (isset($data['center_latitude'], $data['center_longitude'])) {
            $this->validateCoordinates($data['center_latitude'], $data['center_longitude']);
        }

        if (isset($data['polygon_coordinates'])) {
            $this->validatePolygonCoordinates($data['polygon_coordinates']);
        }

        $zone->update($data);
        return $zone->fresh();
    }

    /**
     * Process timesheet location and update geofence status
     */
    public function processTimesheetLocation(Timesheet $timesheet): array
    {
        if (!$timesheet->start_latitude || !$timesheet->start_longitude) {
            return [
                'status' => 'no_location',
                'message' => 'No GPS coordinates available'
            ];
        }

        $validation = $this->validateLocation(
            $timesheet->start_latitude,
            $timesheet->start_longitude,
            $timesheet->project_id,
            $timesheet->employee_id
        );

        // Update timesheet with geofence information
        $timesheet->is_within_geofence = $validation['is_within_any_zone'];

        if ($validation['closest_zone']) {
            $timesheet->distance_from_site = $validation['closest_zone']['distance'];
        }

        if (!empty($validation['violations'])) {
            $existingViolations = $timesheet->geofence_violations ?? [];
            $newViolation = [
                'timestamp' => now()->toISOString(),
                'violations' => $validation['violations'],
                'location' => [
                    'latitude' => $timesheet->start_latitude,
                    'longitude' => $timesheet->start_longitude
                ]
            ];
            $existingViolations[] = $newViolation;
            $timesheet->geofence_violations = $existingViolations;

            // Fire event for violation
            event(new GeofenceViolationDetected($timesheet, $validation['violations']));
        }

        $timesheet->save();

        return [
            'status' => $validation['is_valid'] ? 'valid' : 'violation',
            'message' => $validation['is_valid'] ? 'Location validated successfully' : 'Geofence violations detected',
            'validation' => $validation
        ];
    }

    /**
     * Get geofence statistics for a project or employee
     */
    public function getGeofenceStatistics(?int $projectId = null, ?int $employeeId = null, ?string $dateFrom = null, ?string $dateTo = null): array
    {
        $query = Timesheet::query()
            ->whereNotNull('start_latitude')
            ->whereNotNull('start_longitude');

        if ($projectId) {
            $query->where('project_id', $projectId);
        }

        if ($employeeId) {
            $query->where('employee_id', $employeeId);
        }

        if ($dateFrom) {
            $query->where('date', '>=', $dateFrom);
        }

        if ($dateTo) {
            $query->where('date', '<=', $dateTo);
        }

        $timesheets = $query->get();
        $totalEntries = $timesheets->count();
        $compliantEntries = $timesheets->where('is_within_geofence', true)->count();
        $violationEntries = $timesheets->whereNotNull('geofence_violations')->count();

        return [
            'total_entries' => $totalEntries,
            'compliant_entries' => $compliantEntries,
            'violation_entries' => $violationEntries,
            'compliance_rate' => $totalEntries > 0 ? round(($compliantEntries / $totalEntries) * 100, 2) : 0,
            'average_distance' => $timesheets->whereNotNull('distance_from_site')->avg('distance_from_site') ?? 0,
            'max_distance' => $timesheets->whereNotNull('distance_from_site')->max('distance_from_site') ?? 0
        ];
    }

    /**
     * Get recent geofence violations
     */
    public function getRecentViolations(int $limit = 50, ?int $projectId = null): Collection
    {
        return Timesheet::query()
            ->whereNotNull('geofence_violations')
            ->when($projectId, fn($q) => $q->where('project_id', $projectId))
            ->with(['employee', 'project'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(function ($timesheet) {
                $violations = $timesheet->geofence_violations;
                $latestViolation = is_array($violations) ? end($violations) : null;

                return [
                    'timesheet_id' => $timesheet->id,
                    'employee_name' => $timesheet->employee->name ?? 'Unknown',
                    'project_name' => $timesheet->project->name ?? 'No Project',
                    'date' => $timesheet->date,
                    'violation_count' => is_array($violations) ? count($violations) : 0,
                    'latest_violation' => $latestViolation,
                    'distance_from_site' => $timesheet->distance_from_site
                ];
            });
    }

    /**
     * Validate coordinates
     */
    private function validateCoordinates(float $latitude, float $longitude): void
    {
        if ($latitude < -90 || $latitude > 90) {
            throw new \InvalidArgumentException('Latitude must be between -90 and 90 degrees');
        }

        if ($longitude < -180 || $longitude > 180) {
            throw new \InvalidArgumentException('Longitude must be between -180 and 180 degrees');
        }
    }

    /**
     * Validate polygon coordinates
     */
    private function validatePolygonCoordinates(array $coordinates): void
    {
        if (count($coordinates) < 3) {
            throw new \InvalidArgumentException('Polygon must have at least 3 coordinates');
        }

        foreach ($coordinates as $point) {
            if (!isset($point['lat'], $point['lng'])) {
                throw new \InvalidArgumentException('Each polygon point must have lat and lng properties');
            }
            $this->validateCoordinates($point['lat'], $point['lng']);
        }
    }

    /**
     * Log geofence violation
     */
    private function logGeofenceViolation(
        float $latitude,
        float $longitude,
        array $violations,
        ?int $employeeId = null,
        ?int $projectId = null
    ): void {
        Log::warning('Geofence violation detected', [
            'latitude' => $latitude,
            'longitude' => $longitude,
            'employee_id' => $employeeId,
            'project_id' => $projectId,
            'violations' => $violations,
            'timestamp' => now()->toISOString()
        ]);
    }

    /**
     * Calculate work area coverage for analytics
     */
    public function calculateWorkAreaCoverage(?int $projectId = null, ?string $dateFrom = null, ?string $dateTo = null): array
    {
        $query = Timesheet::query()
            ->whereNotNull('start_latitude')
            ->whereNotNull('start_longitude');

        if ($projectId) {
            $query->where('project_id', $projectId);
        }

        if ($dateFrom) {
            $query->where('date', '>=', $dateFrom);
        }

        if ($dateTo) {
            $query->where('date', '<=', $dateTo);
        }

        $timesheets = $query->get();

        if ($timesheets->isEmpty()) {
            return [
                'center' => null,
                'bounds' => null,
                'coverage_area' => 0,
                'total_points' => 0
            ];
        }

        $latitudes = $timesheets->pluck('start_latitude')->filter();
        $longitudes = $timesheets->pluck('start_longitude')->filter();

        $minLat = $latitudes->min();
        $maxLat = $latitudes->max();
        $minLng = $longitudes->min();
        $maxLng = $longitudes->max();

        $centerLat = ($minLat + $maxLat) / 2;
        $centerLng = ($minLng + $maxLng) / 2;

        // Calculate approximate coverage area (very rough estimate)
        $latDiff = $maxLat - $minLat;
        $lngDiff = $maxLng - $minLng;
        $coverageArea = $latDiff * $lngDiff * 111000 * 111000; // Very rough conversion to square meters

        return [
            'center' => [
                'latitude' => $centerLat,
                'longitude' => $centerLng
            ],
            'bounds' => [
                'north' => $maxLat,
                'south' => $minLat,
                'east' => $maxLng,
                'west' => $minLng
            ],
            'coverage_area' => $coverageArea,
            'total_points' => $timesheets->count()
        ];
    }
}
