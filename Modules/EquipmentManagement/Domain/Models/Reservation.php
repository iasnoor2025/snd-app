<?php

namespace Modules\EquipmentManagement\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reservation extends Model
{
    protected $fillable = [
        'equipment_id',
        'user_id',
        'reserved_from',
        'reserved_to',
        'status',
        'notes',
    ];

    protected $casts = [
        'reserved_from' => 'datetime',
        'reserved_to' => 'datetime',
    ];

    public function equipment(): BelongsTo
    {
        return $this->belongsTo(Equipment::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class);
    }
}
