<?php

namespace Modules\RentalManagement\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RentalExtensionRequestedEquipment extends Model
{
    protected $table = 'rental_extension_requested_equipment';

    protected $fillable = [
        'rental_extension_request_id',
        'equipment_id',
        'quantity',
        'needs_operator',
        'operator_id',
        'daily_rate',
    ];

    protected $casts = [
        'needs_operator' => 'boolean',
        'daily_rate' => 'decimal:2',
    ];

    public function extensionRequest(): BelongsTo
    {
        return $this->belongsTo(RentalExtensionRequest::class, 'rental_extension_request_id');
    }

    public function equipment(): BelongsTo
    {
        return $this->belongsTo(Equipment::class);
    }

    public function operator(): BelongsTo
    {
        return $this->belongsTo(Operator::class);
    }
}




