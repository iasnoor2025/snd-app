<?php

namespace Modules\EquipmentManagement\Domain\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EquipmentCostRecord extends Model
{
    use HasFactory;
    use SoftDeletes;

    // Cost type constants
    const TYPE_OPERATING = 'operating';
    const TYPE_MAINTENANCE = 'maintenance';
    const TYPE_REPAIR = 'repair';
    const TYPE_FUEL = 'fuel';
    const TYPE_PART = 'part';
    const TYPE_LABOR = 'labor';
    const TYPE_INSURANCE = 'insurance';
    const TYPE_TAX = 'tax';
    const TYPE_CERTIFICATION = 'certification';
    const TYPE_OTHER = 'other';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'equipment_id',
        'cost_type',
        'amount',
        'currency',
        'date',
        'reference_number',
        'operating_hours',
        'mileage',
        'maintenance_task_id',
        'description',
        'created_by',
        'updated_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'amount' => 'decimal:2',
        'operating_hours' => 'decimal:2',
        'mileage' => 'decimal:2',
        'date' => 'date',
    ];

    /**
     * Get the equipment this cost record belongs to.
     */
    public function equipment(): BelongsTo
    {
        return $this->belongsTo(Equipment::class);
    }

    /**
     * Get the maintenance task associated with this cost record.
     */
    public function maintenanceTask(): BelongsTo
    {
        return $this->belongsTo(MaintenanceTask::class);
    }

    /**
     * Get the user who created this cost record.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated this cost record.
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Scope a query to only include costs for a specific equipment.
     */
    public function scopeForEquipment($query, $equipmentId)
    {
        return $query->where('equipment_id', $equipmentId);
    }

    /**
     * Scope a query to only include costs within a date range.
     */
    public function scopeInDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }

    /**
     * Scope a query to only include costs of a specific type.
     */
    public function scopeOfType($query, $costType)
    {
        return $query->where('cost_type', $costType);
    }

    /**
     * Scope a query to only include operating costs.
     */
    public function scopeOperating($query)
    {
        return $query->where('cost_type', self::TYPE_OPERATING);
    }

    /**
     * Scope a query to only include maintenance costs.
     */
    public function scopeMaintenance($query)
    {
        return $query->where('cost_type', self::TYPE_MAINTENANCE);
    }

    /**
     * Scope a query to only include repair costs.
     */
    public function scopeRepair($query)
    {
        return $query->where('cost_type', self::TYPE_REPAIR);
    }

    /**
     * Scope a query to only include fuel costs.
     */
    public function scopeFuel($query)
    {
        return $query->where('cost_type', self::TYPE_FUEL);
    }

    /**
     * Get the cost per hour of operation.
     *
     * @return float|null;
     */
    public function getCostPerHour()
    {
        if (!$this->operating_hours || $this->operating_hours <= 0) {
            return null;
        }

        return $this->amount / $this->operating_hours;
    }

    /**
     * Get the cost per mile/kilometer.
     *
     * @return float|null;
     */
    public function getCostPerMile()
    {
        if (!$this->mileage || $this->mileage <= 0) {
            return null;
        }

        return $this->amount / $this->mileage;
    }

    /**
     * Get the formatted amount with currency.
     *
     * @return string;
     */
    public function getFormattedAmount()
    {
        $currencySymbols = [
            'USD' => '$',
            'EUR' => '€',
            'GBP' => '£',
            'JPY' => '¥',
            'CAD' => 'CA$',
            'AUD' => 'A$',
        ];

        $symbol = $currencySymbols[$this->currency] ?? $this->currency;

        return $symbol . number_format($this->amount, 2);
    }

    /**
     * Get available cost types as an array.
     *
     * @return array;
     */
    public static function getAvailableTypes()
    {
        return [
            self::TYPE_OPERATING => 'Operating',
            self::TYPE_MAINTENANCE => 'Maintenance',
            self::TYPE_REPAIR => 'Repair',
            self::TYPE_FUEL => 'Fuel',
            self::TYPE_PART => 'Part',
            self::TYPE_LABOR => 'Labor',
            self::TYPE_INSURANCE => 'Insurance',
            self::TYPE_TAX => 'Tax',
            self::TYPE_CERTIFICATION => 'Certification',
            self::TYPE_OTHER => 'Other',
        ];
    }
}




