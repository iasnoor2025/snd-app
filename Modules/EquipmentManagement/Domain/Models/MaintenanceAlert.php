<?php

namespace Modules\EquipmentManagement\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaintenanceAlert extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'equipment_id',
        'maintenance_record_id',
        'alert_type',
        'severity',
        'status',
        'message',
        'due_date',
        'acknowledged_at',
        'resolved_at',
        'acknowledged_by',
        'resolution_notes',
        'metadata',
    ];

    protected $casts = [
        'due_date' => 'datetime',
        'acknowledged_at' => 'datetime',
        'resolved_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function equipment(): BelongsTo
    {
        return $this->belongsTo(Equipment::class);
    }

    public function maintenanceRecord(): BelongsTo
    {
        return $this->belongsTo(MaintenanceRecord::class);
    }

    public function acknowledgedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'acknowledged_by');
    }
}






