<?php

namespace Modules\TimesheetManagement\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use Modules\ProjectManagement\Domain\Models\Project;
use Modules\Core\Domain\Models\User;

class GeofenceZone extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $fillable = [
        'name',
        'description',
        'center_latitude',
        'center_longitude',
        'radius_meters',
        'polygon_coordinates',
        'zone_type',
        'project_id',
        'site_id',
        'site_address',
        'is_active',
        'strict_enforcement',
        'allow_buffer_zone',
        'buffer_meters',
        'active_from',
        'active_until',
        'active_days',
        'send_alerts',
        'alert_recipients',
        'created_by'
    ];

    protected $casts = [
        'center_latitude' => 'decimal:8',
        'center_longitude' => 'decimal:8',
        'polygon_coordinates' => 'json',
        'is_active' => 'boolean',
        'strict_enforcement' => 'boolean',
        'allow_buffer_zone' => 'boolean',
        'active_days' => 'json',
        'send_alerts' => 'boolean',
        'alert_recipients' => 'json',
        'active_from' => 'datetime:H:i',
        'active_until' => 'datetime:H:i'
    ];

    /**
     * Get the project associated with this geofence zone
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the user who created this geofence zone
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Check if a given coordinate is within this geofence zone
     */
    public function isLocationWithinZone(float $latitude, float $longitude, bool $includeBuffer = true): bool
    {
        if (!$this->is_active) {
            return false;
        }

        // Check time restrictions
        if (!$this->isActiveAtCurrentTime()) {
            return false;
        }

        if ($this->zone_type === 'circular') {
            return $this->isWithinCircularZone($latitude, $longitude, $includeBuffer);
        } elseif ($this->zone_type === 'polygon') {
            return $this->isWithinPolygonZone($latitude, $longitude, $includeBuffer);
        }

        return false;
    }

    /**
     * Check if the zone is active at the current time
     */
    public function isActiveAtCurrentTime(): bool
    {
        $now = now();

        // Check day of week
        if ($this->active_days) {
            $currentDay = $now->dayOfWeek; // 0 = Sunday, 1 = Monday, etc.
            if (!in_array($currentDay, $this->active_days)) {
                return false;
            }
        }

        // Check time range
        if ($this->active_from && $this->active_until) {
            $currentTime = $now->format('H:i');
            return $currentTime >= $this->active_from->format('H:i') &&
                   $currentTime <= $this->active_until->format('H:i');
        }

        return true;
    }

    /**
     * Check if location is within circular geofence
     */
    private function isWithinCircularZone(float $latitude, float $longitude, bool $includeBuffer = true): bool
    {
        $distance = $this->calculateDistance(
            $this->center_latitude,
            $this->center_longitude,
            $latitude,
            $longitude
        );

        $allowedRadius = $this->radius_meters;
        if ($includeBuffer && $this->allow_buffer_zone) {
            $allowedRadius += $this->buffer_meters;
        }

        return $distance <= $allowedRadius;
    }

    /**
     * Check if location is within polygon geofence
     */
    private function isWithinPolygonZone(float $latitude, float $longitude, bool $includeBuffer = true): bool
    {
        if (!$this->polygon_coordinates) {
            return false;
        }

        // Point-in-polygon algorithm (Ray casting)
        $vertices = $this->polygon_coordinates;
        $intersections = 0;
        $vertexCount = count($vertices);

        for ($i = 0; $i < $vertexCount; $i++) {
            $j = ($i + 1) % $vertexCount;

            $xi = $vertices[$i]['lat'];
            $yi = $vertices[$i]['lng'];
            $xj = $vertices[$j]['lat'];
            $yj = $vertices[$j]['lng'];

            if ((($yi > $longitude) !== ($yj > $longitude)) &&
                ($latitude < ($xj - $xi) * ($longitude - $yi) / ($yj - $yi) + $xi)) {
                $intersections++;
            }
        }

        $isInside = ($intersections % 2) === 1;

        // For polygon zones, buffer is handled by expanding the polygon
        // This is a simplified approach - in production, you might want to use a proper buffer algorithm
        if (!$isInside && $includeBuffer && $this->allow_buffer_zone) {
            // Check if point is within buffer distance of any polygon edge
            $minDistance = $this->getMinimumDistanceToPolygon($latitude, $longitude);
            return $minDistance <= $this->buffer_meters;
        }

        return $isInside;
    }

    /**
     * Calculate distance between two coordinates using Haversine formula
     */
    public function calculateDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6371000; // Earth's radius in meters

        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLon / 2) * sin($dLon / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }

    /**
     * Get minimum distance from point to polygon edges
     */
    private function getMinimumDistanceToPolygon(float $latitude, float $longitude): float
    {
        if (!$this->polygon_coordinates) {
            return PHP_FLOAT_MAX;
        }

        $vertices = $this->polygon_coordinates;
        $minDistance = PHP_FLOAT_MAX;
        $vertexCount = count($vertices);

        for ($i = 0; $i < $vertexCount; $i++) {
            $j = ($i + 1) % $vertexCount;

            $distance = $this->calculateDistance(
                $latitude,
                $longitude,
                $vertices[$i]['lat'],
                $vertices[$i]['lng']
            );

            $minDistance = min($minDistance, $distance);
        }

        return $minDistance;
    }

    /**
     * Get distance from a given point to this zone
     */
    public function getDistanceFromZone(float $latitude, float $longitude): float
    {
        if ($this->zone_type === 'circular') {
            $distanceToCenter = $this->calculateDistance(
                $this->center_latitude,
                $this->center_longitude,
                $latitude,
                $longitude
            );

            return max(0, $distanceToCenter - $this->radius_meters);
        } elseif ($this->zone_type === 'polygon') {
            if ($this->isWithinPolygonZone($latitude, $longitude, false)) {
                return 0; // Inside polygon
            }
            return $this->getMinimumDistanceToPolygon($latitude, $longitude);
        }

        return PHP_FLOAT_MAX;
    }

    /**
     * Activity log configuration
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'is_active', 'center_latitude', 'center_longitude', 'radius_meters'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    /**
     * Scope for active zones
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for zones associated with a project
     */
    public function scopeForProject($query, $projectId)
    {
        return $query->where('project_id', $projectId);
    }
}
