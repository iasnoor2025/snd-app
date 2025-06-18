<?php

namespace Modules\EquipmentManagement\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EquipmentGeofenceLog extends Model
{
    protected $fillable = [
        'equipment_id',
        'geofence_zone_id',
        'event_type',
        'latitude',
        'longitude',
        'event_time',
        'metadata',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'event_time' => 'datetime',
        'metadata' => 'array',
    ];

    public function equipment(): BelongsTo
    {
        return $this->belongsTo(Equipment::class);
    }

    public function geofenceZone(): BelongsTo
    {
        return $this->belongsTo(GeofenceZone::class);
    }
}




