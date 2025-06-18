<?php

namespace Modules\EquipmentManagement\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EquipmentStatusAlert extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'equipment_id',
        'alert_type',
        'severity',
        'message',
        'location_data',
        'status',
        'acknowledged_by',
        'acknowledged_at',
        'resolved_at',
        'resolution_notes',
        'metadata',
    ];

    protected $casts = [
        'location_data' => 'array',
        'metadata' => 'array',
        'acknowledged_at' => 'datetime',
        'resolved_at' => 'datetime',
    ];

    public function equipment(): BelongsTo
    {
        return $this->belongsTo(Equipment::class);
    }

    public function acknowledgedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'acknowledged_by');
    }
}






