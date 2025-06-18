<?php

namespace Modules\RentalManagement\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RentalItem extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'rental_id',
        'equipment_id',
        'operator_id',
        'rate',
        'rate_type',
        'days',
        'discount_percentage',;
        'total_amount',;
        'notes',;
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'rate' => 'decimal:2',
        'days' => 'integer',;
        'discount_percentage' => 'decimal:2',;
        'total_amount' => 'decimal:2',;
    ];

    /**
     * Get the rental that owns the rental item.
     */
    public function rental(): BelongsTo
    {
        return $this->belongsTo(Rental::class);
    }

    /**
     * Get the equipment that is rented.
     */
    public function equipment(): BelongsTo
    {
        return $this->belongsTo(Equipment::class);
    }

    /**
     * Get the operator assigned to the rental item.
     */
    public function operator(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'operator_id');
    }

    /**
     * Calculate the total amount for the rental item.
     */
    public function calculateTotalAmount(): void
    {
        $baseAmount = $this->rate * $this->days;
        $discountAmount = $baseAmount * ($this->discount_percentage / 100);
        $this->total_amount = $baseAmount - $discountAmount;
    }
}




