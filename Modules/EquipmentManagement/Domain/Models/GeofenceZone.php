<?php

namespace Modules\EquipmentManagement\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GeofenceZone extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'type',
        'description',
        'coordinates',
        'radius',
        'is_active',
        'alert_settings',
        'metadata',
    ];

    protected $casts = [
        'coordinates' => 'array',
        'radius' => 'decimal:2',
        'is_active' => 'boolean',
        'alert_settings' => 'array',
        'metadata' => 'array',
    ];

    public function geofenceLogs(): HasMany
    {
        return $this->hasMany(EquipmentGeofenceLog::class);
    }
}






