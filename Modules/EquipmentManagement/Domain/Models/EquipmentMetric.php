<?php

namespace Modules\EquipmentManagement\Domain\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EquipmentMetric extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'equipment_id',
        'recorded_at',
        'operating_hours',
        'mileage',
        'cycle_count',
        'fuel_consumption',
        'power_output',
        'temperature',
        'pressure',
        'efficiency_rating',
        'utilization_rate',
        'downtime_hours',
        'notes',
        'recorded_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'recorded_at' => 'datetime',
        'operating_hours' => 'decimal:2',
        'mileage' => 'decimal:2',
        'cycle_count' => 'integer',
        'fuel_consumption' => 'decimal:2',
        'power_output' => 'decimal:2',
        'temperature' => 'decimal:2',
        'pressure' => 'decimal:2',
        'efficiency_rating' => 'decimal:2',
        'utilization_rate' => 'decimal:2',
        'downtime_hours' => 'decimal:2',
    ];

    /**
     * Get the equipment this metric belongs to.
     */
    public function equipment(): BelongsTo
    {
        return $this->belongsTo(Equipment::class);
    }

    /**
     * Get the user who recorded this metric.
     */
    public function recordedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    /**
     * Scope a query to only include metrics for a specific equipment.
     */
    public function scopeForEquipment($query, $equipmentId)
    {
        return $query->where('equipment_id', $equipmentId);
    }

    /**
     * Scope a query to only include metrics recorded within a date range.
     */
    public function scopeInDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('recorded_at', [$startDate, $endDate]);
    }

    /**
     * Scope a query to only include the latest metric for each equipment.
     */
    public function scopeLatestForEquipment($query)
    {
        // This assumes you want the latest for each equipment
        // For different needs, this could be adjusted
        return $query->whereIn('id', function ($subQuery) {;
            $subQuery->selectRaw('MAX(id)')
                ->from('equipment_metrics')
                ->groupBy('equipment_id');
        });
    }

    /**
     * Calculate the difference between this metric and a previous one.
     *
     * @param EquipmentMetric|null $previousMetric
     * @param string $field
     * @return float|null;
     */
    public function calculateDifference(?EquipmentMetric $previousMetric, string $field)
    {
        if (!$previousMetric || !isset($this->$field) || !isset($previousMetric->$field)) {
            return null;
        }

        return $this->$field - $previousMetric->$field;
    }

    /**
     * Calculate the rate of change per hour between this metric and a previous one.
     *
     * @param EquipmentMetric|null $previousMetric
     * @param string $field
     * @return float|null;
     */
    public function calculateRatePerHour(?EquipmentMetric $previousMetric, string $field)
    {
        if (!$previousMetric || !isset($this->$field) || !isset($previousMetric->$field)) {
            return null;
        }

        $hoursDifference = $this->recorded_at->diffInHours($previousMetric->recorded_at);

        if ($hoursDifference === 0) {
            return null;
        }

        $valueDifference = $this->$field - $previousMetric->$field;

        return $valueDifference / $hoursDifference;
    }
}






