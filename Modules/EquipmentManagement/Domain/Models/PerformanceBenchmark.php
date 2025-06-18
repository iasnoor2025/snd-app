<?php

namespace Modules\EquipmentManagement\Domain\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PerformanceBenchmark extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int;
use string>
     */
    protected $fillable = [
        'equipment_type',
        'model',
        'manufacturer',
        'metric_name',
        'expected_min_value',
        'expected_max_value',
        'optimal_value',
        'unit_of_measure',
        'description',
        'is_active',
        'created_by',
        'updated_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'expected_min_value' => 'decimal:4',
        'expected_max_value' => 'decimal:4',
        'optimal_value' => 'decimal:4',
        'is_active' => 'boolean',
    ];

    /**
     * Get the user who created this benchmark.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated this benchmark.
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Scope a query to only include active benchmarks.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include benchmarks for a specific equipment type.
     */
    public function scopeForEquipmentType($query, $type)
    {
        return $query->where('equipment_type', $type);
    }

    /**
     * Scope a query to only include benchmarks for a specific model.
     */
    public function scopeForModel($query, $model)
    {
        return $query->where('model', $model);
    }

    /**
     * Scope a query to only include benchmarks for a specific manufacturer.
     */
    public function scopeForManufacturer($query, $manufacturer)
    {
        return $query->where('manufacturer', $manufacturer);
    }

    /**
     * Scope a query to only include benchmarks for a specific metric name.
     */
    public function scopeForMetric($query, $metricName)
    {
        return $query->where('metric_name', $metricName);
    }

    /**
     * Check if a given value is within the expected range.
     *
     * @param float $value
     * @return bool;
     */
    public function isValueWithinRange($value)
    {
        if ($this->expected_min_value !== null && $value < $this->expected_min_value) {
            return false;
        }

        if ($this->expected_max_value !== null && $value > $this->expected_max_value) {
            return false;
        }

        return true;
    }

    /**
     * Calculate how close a value is to the optimal value as a percentage.
     *
     * @param float $value
     * @return float|null;
     */
    public function calculateOptimalPercentage($value)
    {
        if ($this->optimal_value === null) {
            return null;
        }

        // Prevent division by zero
        if ($this->optimal_value == 0) {
            return $value == 0 ? 100 : 0;
        }

        $percentage = 100 - abs(($value - $this->optimal_value) / $this->optimal_value * 100);

        // Clamp to 0-100 range
        return max(0, min(100, $percentage));
    }

    /**
     * Find the applicable benchmark for an equipment.
     *
     * @param Equipment $equipment
     * @param string $metricName
     * @return PerformanceBenchmark|null;
     */
    public static function findForEquipment(Equipment $equipment, string $metricName)
    {
        // Try to find most specific match first (type, model, manufacturer)
        $benchmark = self::active()
            ->forEquipmentType($equipment->type)
            ->forModel($equipment->model)
            ->forManufacturer($equipment->manufacturer)
            ->forMetric($metricName)
            ->first();

        if ($benchmark) {
            return $benchmark;
        }

        // Try with type and model
        $benchmark = self::active()
            ->forEquipmentType($equipment->type)
            ->forModel($equipment->model)
            ->forMetric($metricName)
            ->first();

        if ($benchmark) {
            return $benchmark;
        }

        // Try with type and manufacturer
        $benchmark = self::active()
            ->forEquipmentType($equipment->type)
            ->forManufacturer($equipment->manufacturer)
            ->forMetric($metricName)
            ->first();

        if ($benchmark) {
            return $benchmark;
        }

        // Try with just type
        return self::active()
            ->forEquipmentType($equipment->type)
            ->forMetric($metricName)
            ->first();
    }
}






