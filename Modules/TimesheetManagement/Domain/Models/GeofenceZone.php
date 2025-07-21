<?php

namespace Modules\TimesheetManagement\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Modules\ProjectManagement\Domain\Models\Project;

class GeofenceZone extends Model
{
    use SoftDeletes;

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
        'monitoring_enabled',
        'alert_on_violation',
        'metadata',
    ];

    protected $casts = [
        'center_latitude' => 'decimal:8',
        'center_longitude' => 'decimal:8',
        'radius_meters' => 'integer',
        'polygon_coordinates' => 'array',
        'is_active' => 'boolean',
        'strict_enforcement' => 'boolean',
        'allow_buffer_zone' => 'boolean',
        'buffer_meters' => 'integer',
        'active_from' => 'datetime:H:i',
        'active_until' => 'datetime:H:i',
        'active_days' => 'array',
        'monitoring_enabled' => 'boolean',
        'alert_on_violation' => 'boolean',
        'metadata' => 'array',
    ];

    /**
     * Get the project that owns the geofence zone.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the timesheets that reference this geofence zone.
     */
    public function timesheets(): HasMany
    {
        return $this->hasMany(Timesheet::class, 'project_id', 'project_id');
    }

    /**
     * Check if the zone is currently active based on time restrictions.
     */
    public function isCurrentlyActive(): bool
    {
        if (!$this->is_active) {
            return false;
        }

        $now = now();

        // Check time restrictions
        if ($this->active_from && $this->active_until) {
            $currentTime = $now->format('H:i:s');
            if ($currentTime < $this->active_from || $currentTime > $this->active_until) {
                return false;
            }
        }

        // Check day restrictions
        if ($this->active_days && !empty($this->active_days)) {
            $currentDay = $now->dayOfWeek;
            if (!in_array($currentDay, $this->active_days)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get the effective radius including buffer zone.
     */
    public function getEffectiveRadius(): int
    {
        $radius = $this->radius_meters;

        if ($this->allow_buffer_zone && $this->buffer_meters > 0) {
            $radius += $this->buffer_meters;
        }

        return $radius;
    }

    /**
     * Check if a location is within this zone.
     */
    public function isLocationWithin(float $latitude, float $longitude): bool
    {
        if ($this->zone_type === 'circular') {
            return $this->isWithinCircularZone($latitude, $longitude);
        } elseif ($this->zone_type === 'polygon') {
            return $this->isWithinPolygonZone($latitude, $longitude);
        }

        return false;
    }

    /**
     * Check if location is within circular zone.
     */
    protected function isWithinCircularZone(float $latitude, float $longitude): bool
    {
        $distance = $this->calculateDistance(
            $latitude,
            $longitude,
            $this->center_latitude,
            $this->center_longitude
        );

        return $distance <= $this->getEffectiveRadius();
    }

    /**
     * Check if location is within polygon zone.
     */
    protected function isWithinPolygonZone(float $latitude, float $longitude): bool
    {
        if (!$this->polygon_coordinates || empty($this->polygon_coordinates)) {
            return false;
        }

        $coordinates = $this->polygon_coordinates;
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
     * Calculate distance between two points using Haversine formula.
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
}
