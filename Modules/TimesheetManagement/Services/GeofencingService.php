<?php

namespace Modules\TimesheetManagement\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Modules\TimesheetManagement\Domain\Models\GeofenceZone;
use Modules\TimesheetManagement\Domain\Models\Timesheet;
use Modules\TimesheetManagement\Events\GeofenceViolationDetected;
use Carbon\Carbon;

class GeofencingService
{
    /**
     * Validate location against geofence zones
     */
    public function validateLocation(float $latitude, float $longitude, $user = null, ?int $projectId = null): array
    {
        $zones = $this->getActiveZones($projectId);
        $violations = [];
        $compliant = true;

        foreach ($zones as $zone) {
            $isWithinZone = $this->isLocationWithinZone($latitude, $longitude, $zone);

            if (!$isWithinZone) {
                $violations[] = [
                    'zone_id' => $zone->id,
                    'zone_name' => $zone->name,
                    'type' => 'outside_zone',
                    'distance' => $this->calculateDistance($latitude, $longitude, $zone->center_latitude, $zone->center_longitude),
                    'severity' => $zone->strict_enforcement ? 'high' : 'medium'
                ];
                $compliant = false;
            }
        }

        return [
            'compliant' => $compliant,
            'violations' => $violations,
            'zones' => $zones,
            'location' => [
                'latitude' => $latitude,
                'longitude' => $longitude
            ]
        ];
    }

    /**
     * Get active geofence zones for a project
     */
    protected function getActiveZones(?int $projectId = null): \Illuminate\Support\Collection
    {
        $query = GeofenceZone::where('is_active', true);

        if ($projectId) {
            $query->where('project_id', $projectId);
        }

        return $query->get();
    }

    /**
     * Check if location is within a geofence zone
     */
    protected function isLocationWithinZone(float $latitude, float $longitude, GeofenceZone $zone): bool
    {
        if ($zone->zone_type === 'circular') {
            return $this->isWithinCircularZone($latitude, $longitude, $zone);
        } elseif ($zone->zone_type === 'polygon') {
            return $this->isWithinPolygonZone($latitude, $longitude, $zone);
        }

        return false;
    }

    /**
     * Check if location is within a circular zone
     */
    protected function isWithinCircularZone(float $latitude, float $longitude, GeofenceZone $zone): bool
    {
        $distance = $this->calculateDistance(
            $latitude,
            $longitude,
            $zone->center_latitude,
            $zone->center_longitude
        );

        $radius = $zone->radius_meters;
        if ($zone->allow_buffer_zone) {
            $radius += $zone->buffer_meters;
        }

        return $distance <= $radius;
    }

    /**
     * Check if location is within a polygon zone
     */
    protected function isWithinPolygonZone(float $latitude, float $longitude, GeofenceZone $zone): bool
    {
        if (!$zone->polygon_coordinates) {
            return false;
        }

        $coordinates = $zone->polygon_coordinates;
        $inside = false;
        $j = count($coordinates) - 1;

        for ($i = 0; $i < count($coordinates); $i++) {
            if ((($coordinates[$i]['lat'] > $latitude) != ($coordinates[$j]['lat'] > $latitude)) &&
                ($longitude < ($coordinates[$j]['lng'] - $coordinates[$i]['lng']) * ($latitude - $coordinates[$i]['lat']) / ($coordinates[$j]['lat'] - $coordinates[$i]['lat']) + $coordinates[$i]['lng'])) {
                $inside = !$inside;
            }
            $j = $i;
        }

        return $inside;
    }

    /**
     * Calculate distance between two points using Haversine formula
     */
    protected function calculateDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6371000; // Earth's radius in meters

        $latDelta = deg2rad($lat2 - $lat1);
        $lonDelta = deg2rad($lon2 - $lon1);

        $a = sin($latDelta / 2) * sin($latDelta / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($lonDelta / 2) * sin($lonDelta / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }

    /**
     * Process timesheet location and detect violations
     */
    public function processTimesheetLocation(Timesheet $timesheet, float $latitude, float $longitude): array
    {
        $validation = $this->validateLocation($latitude, $longitude, null, $timesheet->project_id);

        if (!$validation['compliant']) {
            // Fire violation event
            event(new GeofenceViolationDetected($timesheet, $validation['violations']));

            // Update timesheet with violation data
            $timesheet->update([
                'is_within_geofence' => false,
                'geofence_violations' => $validation['violations'],
                'distance_from_site' => $this->getDistanceFromNearestZone($latitude, $longitude, $timesheet->project_id)
            ]);
        } else {
            $timesheet->update([
                'is_within_geofence' => true,
                'geofence_violations' => null,
                'distance_from_site' => 0
            ]);
        }

        return $validation;
    }

    /**
     * Get distance from nearest zone
     */
    protected function getDistanceFromNearestZone(float $latitude, float $longitude, ?int $projectId): float
    {
        $zones = $this->getActiveZones($projectId);
        $minDistance = PHP_FLOAT_MAX;

        foreach ($zones as $zone) {
            $distance = $this->calculateDistance(
                $latitude,
                $longitude,
                $zone->center_latitude,
                $zone->center_longitude
            );
            $minDistance = min($minDistance, $distance);
        }

        return $minDistance === PHP_FLOAT_MAX ? 0 : $minDistance;
    }

    /**
     * Get geofence statistics
     */
    public function getStatistics(?int $projectId = null, ?string $period = null): array
    {
        $query = Timesheet::query();

        if ($projectId) {
            $query->where('project_id', $projectId);
        }

        if ($period) {
            $query->where('created_at', '>=', Carbon::now()->subDays($period === 'week' ? 7 : 30));
        }

        $total = $query->count();
        $withinGeofence = $query->where('is_within_geofence', true)->count();
        $violations = $query->whereNotNull('geofence_violations')->count();

        return [
            'total_timesheets' => $total,
            'within_geofence' => $withinGeofence,
            'violations' => $violations,
            'compliance_rate' => $total > 0 ? round(($withinGeofence / $total) * 100, 2) : 0
        ];
    }
}
