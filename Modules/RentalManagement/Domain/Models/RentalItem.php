<?php

namespace Modules\RentalManagement\Domain\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Traits\AutoLoadsRelations;

class RentalItem extends Model
{
    use HasFactory;
use AutoLoadsRelations;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'rental_id',
        'equipment_id',
        'needs_equipment_sync',
        'rate',
        'rate_type',
        'status',
        'operator_id',
        'notes',
        'total_amount',
        'discount_percentage',
        'days',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'rate' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'days' => 'integer',
    ];

    /**
     * Get the rental that owns the rental item.
     */
    public function rental(): BelongsTo
    {
        return $this->belongsTo(Rental::class);
    }

    /**
     * Get the equipment for the rental item.
     */
    public function equipment(): BelongsTo
    {
        return $this->belongsTo(Equipment::class);
    }

    /**
     * Get the operator (employee) for the rental item
     */
    public function operator(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'operator_id');
    }

    /**
     * Get the rate based on the rate type from the equipment
     */
    public function getRateAttribute()
    {
        if (!$this->equipment) {
            return $this->attributes['rate'] ?? 0;
        }

        $rateField = $this->rate_type . '_rate';
        return $this->equipment->$rateField ?? $this->attributes['rate'] ?? 0;
    }

    /**
     * Calculate total amount based on rate, quantity, and days
     */
    public function getTotalAmountAttribute()
    {
        // Only calculate if total_amount is not already set
        if (isset($this->attributes['total_amount']) && $this->attributes['total_amount'] > 0) {
            return $this->attributes['total_amount'];
        }

        $days = $this->days ?? 1; // Default to 1 day if not set
        return $this->rate * $days;
    }

    /**
     * Calculate the subtotal (before discount)
     */
    public function getSubtotalAttribute(): float
    {
        $days = $this->days ?? 1; // Default to 1 day if not set
        return $this->rate * $days;
    }

    /**
     * Calculate the discount amount
     */
    public function getDiscountAmountAttribute(): float
    {
        return $this->subtotal * ($this->discount_percentage / 100);
    }

    /**
     * Boot method to set up model event hooks
     */
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($rentalItem) {
            // Ensure total_amount is calculated and set before saving
            if (empty($rentalItem->total_amount)) {
                $days = $rentalItem->days ?? 1; // Default to 1 day if not set
                $rentalItem->total_amount = $rentalItem->rate * $days;
            }
        });
    }
}




