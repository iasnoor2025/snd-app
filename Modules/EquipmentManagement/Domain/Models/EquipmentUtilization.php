<?php

namespace Modules\EquipmentManagement\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EquipmentUtilization extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'equipment_id',
        'date',
        'total_hours',
        'active_hours',
        'utilization_rate',
        'rental_count',
        'revenue_per_hour',
        'usage_patterns',
    ];

    protected $casts = [
        'date' => 'date',
        'utilization_rate' => 'decimal:2',
        'revenue_per_hour' => 'decimal:2',
        'usage_patterns' => 'array',
    ];

    public function equipment(): BelongsTo
    {
        return $this->belongsTo(Equipment::class);
    }
}






