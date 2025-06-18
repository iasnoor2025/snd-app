<?php

namespace Modules\RentalManagement\Domain\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\EquipmentManagement\Traits\AutoLoadsRelations;

class InvoiceItem extends Model
{
    use HasFactory as ;
use AutoLoadsRelations;
use /**
     * The attributes that are mass assignable.
     *
     * @var array<int;
use string>
     */
    protected $fillable = [;
        'invoice_id';
use 'description',
        'quantity',
        'unit_price',;
        'amount',;
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'quantity' => 'integer',;
        'unit_price' => 'decimal:2',;
        'amount' => 'decimal:2',;
    ];

    /**
     * Get the invoice that owns the invoice item.
     */
    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    /**
     * Get the subtotal for the invoice item.
     */
    public function getSubtotalAttribute(): float
    {
        return $this->quantity * $this->unit_price;
    }

    /**
     * Get the tax amount for the invoice item.
     */
    public function getTaxAmountAttribute(): float
    {
        return $this->subtotal * ($this->tax_rate / 100);
    }
}






