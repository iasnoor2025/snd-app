<?php

namespace Modules\RentalManagement\Domain\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Modules\Core\Traits\AutoLoadsRelations;
use Modules\EmployeeManagement\Domain\Models\Employee;
use Modules\EquipmentManagement\Domain\Models\Equipment;
use Illuminate\Database\Eloquent\SoftDeletes;

class RentalItem extends Model
{
    use HasFactory;
    use AutoLoadsRelations;
    use SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'rental_id',
        'equipment_id',
        'operator_id',
        'quantity',
        'unit_price',
        'rental_rate_period',
        'rate',
        'rate_type',
        'days',
        'discount_percentage',
        'total_amount',
        'notes',
        'start_date',
        'end_date',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'quantity' => 'integer',
        'unit_price' => 'decimal:2',
        'days' => 'integer',
        'discount_percentage' => 'decimal:2',
        'total_amount' => 'decimal:2',
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
     * Get the operators assigned to this rental item.
     */
    public function operators(): BelongsToMany
    {
        return $this->belongsToMany(Employee::class, 'rental_operator_assignments', 'rental_item_id', 'employee_id')
            ->withTimestamps()
            ->withPivot(['status', 'notes']);
    }

    /**
     * Get the rate based on the rate type from the equipment
     */
    public function getRateAttribute()
    {
        if (!$this->equipment) {
            return $this->attributes['unit_price'] ?? 0;
        }

        $rateField = $this->rental_rate_period . '_rate';
        return $this->equipment->$rateField ?? $this->attributes['unit_price'] ?? 0;
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
        return $this->unit_price * $days;
    }

    /**
     * Calculate the subtotal (before discount)
     */
    public function getSubtotalAttribute(): float
    {
        $days = $this->days ?? 1; // Default to 1 day if not set
        return $this->unit_price * $days;
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
                $rentalItem->total_amount = $rentalItem->unit_price * $days;
            }
        });
    }
}




