<?php

namespace Modules\EquipmentManagement\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PurchaseOrder extends Model
{
    protected $fillable = [
        'supplier_id',
        'equipment_id',
        'order_date',
        'quantity',
        'unit_price',
        'status',
        'notes',
    ];

    protected $casts = [
        'order_date' => 'date',
        'unit_price' => 'float',
    ];

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function equipment(): BelongsTo
    {
        return $this->belongsTo(Equipment::class);
    }
}
