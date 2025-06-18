<?php

namespace Modules\RentalManagement\Domain\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class RentalTimesheet extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int;
use string>
     */
    protected $fillable = [
        'rental_id',
        'rental_item_id',
        'equipment_id',
        'operator_id',
        'operator_absent',
        'date',
        'start_time',
        'end_time',
        'hours_used',
        'notes',
        'status',
        'status_updated_at',
        'status_updated_by',
        'created_by',
        'approved_by',
        'approved_at',
        'rate',
        'total_amount',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'date' => 'date',
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
        'hours_used' => 'decimal:2',
        'rate' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'approved_at' => 'datetime',
        'status_updated_at' => 'datetime',
        'operator_absent' => 'boolean',
    ];

    /**
     * Get the rental that owns the timesheet.
     */
    public function rental()
    {
        return $this->belongsTo(Rental::class);
    }

    /**
     * Get the rental item that the timesheet is for.
     */
    public function rentalItem()
    {
        return $this->belongsTo(RentalItem::class);
    }

    /**
     * Get the equipment directly.
     * This is a shortcut to access equipment when rentalItem is missing.
     */
    public function equipment()
    {
        return $this->belongsTo(Equipment::class, 'equipment_id');
    }

    /**
     * Get the operator that has completed the timesheet.
     */
    public function operator()
    {
        return $this->belongsTo(Employee::class, 'operator_id');
    }

    /**
     * Get the user who created the timesheet.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who approved the timesheet.
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get the user who last updated the status.
     */
    public function statusUpdatedBy()
    {
        return $this->belongsTo(User::class, 'status_updated_by');
    }

    /**
     * Check if the timesheet can be managed by the given user.
     */
    public function canBeUpdatedBy(User $user): bool
    {
        return $user->hasRole(['admin', 'manager', 'accountant']) && $this->status === 'completed';
    }

    /**
     * Calculate hours used from start and end time.
     */
    public function calculateHoursUsed(): float
    {
        if ($this->start_time && $this->end_time) {
            $start = new \DateTime($this->start_time);
            $end = new \DateTime($this->end_time);
            $diff = $start->diff($end);

            // Convert to decimal hours
            $hours = $diff->h + ($diff->i / 60);
            return round($hours, 2);
        }

        return $this->hours_used ?? 0;
    }

    /**
     * Save calculated hours when saving the model.
     */
    protected static function booted()
    {
        static::saving(function ($timesheet) {
            if ($timesheet->start_time && $timesheet->end_time) {
                $timesheet->hours_used = $timesheet->calculateHoursUsed();
            }
        });
    }

    /**
     * Get the rate for this timesheet based on the rental item's rate type.
     */
    public function getRateAttribute()
    {
        if (!$this->rentalItem) {
            return null;
        }

        $rateType = $this->rentalItem->rate_type;
        $equipment = $this->rentalItem->equipment;

        if (!$equipment) {
            return $this->rentalItem->rate;
        }

        $rateField = $rateType . '_rate';
        return $equipment->$rateField ?? $this->rentalItem->rate;
    }

    /**
     * Get the total amount for this timesheet.
     */
    public function getTotalAmountAttribute()
    {
        $rate = $this->rate;
        if (!$rate) {
            return 0;
        }

        return $rate * $this->hours_used;
    }
}






