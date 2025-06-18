<?php

namespace Modules\EquipmentManagement\Domain\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class EquipmentTracking extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'equipment_id',
        'status',
        'latitude',
        'longitude',
        'location_name',
        'current_rental_id',
        'last_updated_at',
        'metadata',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'last_updated_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function equipment()
    {
        return $this->belongsTo(Equipment::class);
    }

    public function currentRental()
    {
        return $this->belongsTo(Rental::class, 'current_rental_id');
    }

    public function updateLocation(array $location, string $status)
    {
        $this->update([
            'latitude' => $location['latitude'],
            'longitude' => $location['longitude'],
            'location_name' => $location['location_name'],
            'status' => $status,
            'last_updated_at' => now(),
        ]);

        event(new EquipmentLocationUpdated($this->equipment, $location, $status));
    }
}






