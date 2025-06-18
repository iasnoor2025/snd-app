<?php

namespace Modules\EquipmentManagement\Domain\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class EquipmentDepreciation extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'equipment_depreciation';

    /**
     * Depreciation method constants.
     */
    const METHOD_STRAIGHT_LINE = 'straight_line';
    const METHOD_DOUBLE_DECLINING = 'double_declining';
    const METHOD_SUM_OF_YEARS = 'sum_of_years_digits';
    const METHOD_UNITS_OF_PRODUCTION = 'units_of_production';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'equipment_id',
        'initial_value',
        'residual_value',
        'current_value',
        'depreciation_method',
        'useful_life_years',
        'depreciation_start_date',
        'last_depreciation_date',
        'fully_depreciated_date',
        'annual_depreciation_rate',
        'annual_depreciation_amount',
        'depreciation_schedule',
        'depreciation_factors',
        'created_by',
        'updated_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'initial_value' => 'decimal:2',
        'residual_value' => 'decimal:2',
        'current_value' => 'decimal:2',
        'depreciation_start_date' => 'date',
        'last_depreciation_date' => 'date',
        'fully_depreciated_date' => 'date',
        'annual_depreciation_rate' => 'decimal:4',
        'annual_depreciation_amount' => 'decimal:2',
        'depreciation_schedule' => 'array',
        'depreciation_factors' => 'array',
    ];

    /**
     * Get the equipment that owns the depreciation.
     */
    public function equipment(): BelongsTo
    {
        return $this->belongsTo(Equipment::class);
    }

    /**
     * Get the user who created this record.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated this record.
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Get available depreciation methods.
     *
     * @return array;
     */
    public static function getAvailableMethods(): array
    {
        return [
            self::METHOD_STRAIGHT_LINE => 'Straight Line',
            self::METHOD_DOUBLE_DECLINING => 'Double Declining Balance',
            self::METHOD_SUM_OF_YEARS => 'Sum of Years Digits',
            self::METHOD_UNITS_OF_PRODUCTION => 'Units of Production',
        ];
    }

    /**
     * Calculate current value based on depreciation method and elapsed time.
     *
     * @param string|null $asOfDate
     * @return float;
     */
    public function calculateCurrentValue(?string $asOfDate = null): float
    {
        $asOfDate = $asOfDate ? Carbon::parse($asOfDate) : Carbon::now();

        if ($asOfDate <= $this->depreciation_start_date) {
            return $this->initial_value;
        }

        if ($this->fully_depreciated_date && $asOfDate >= $this->fully_depreciated_date) {
            return $this->residual_value;
        }

        $yearsElapsed = $this->depreciation_start_date->diffInDays($asOfDate) / 365.25;

        switch ($this->depreciation_method) {
            case self::METHOD_STRAIGHT_LINE:
                return $this->calculateStraightLineValue($yearsElapsed);
            case self::METHOD_DOUBLE_DECLINING:
                return $this->calculateDoubleDecliningValue($yearsElapsed);
            case self::METHOD_SUM_OF_YEARS:
                return $this->calculateSumOfYearsValue($yearsElapsed);
            case self::METHOD_UNITS_OF_PRODUCTION:
                return $this->calculateUnitOfProductionValue();
            default:
                return $this->current_value;
        }
    }

    /**
     * Calculate straight line depreciation value.
     *
     * @param float $yearsElapsed
     * @return float;
     */
    protected function calculateStraightLineValue(float $yearsElapsed): float
    {
        $depreciableValue = $this->initial_value - $this->residual_value;
        $annualDepreciation = $depreciableValue / $this->useful_life_years;
        $accumulatedDepreciation = $annualDepreciation * min($yearsElapsed, $this->useful_life_years);

        return max($this->initial_value - $accumulatedDepreciation, $this->residual_value);
    }

    /**
     * Calculate double declining balance depreciation value.
     *
     * @param float $yearsElapsed
     * @return float;
     */
    protected function calculateDoubleDecliningValue(float $yearsElapsed): float
    {
        $rate = 2 / $this->useful_life_years;
        $currentValue = $this->initial_value;
        $fullYearsElapsed = floor($yearsElapsed);

        // Calculate for full years
        for ($i = 0; $i < $fullYearsElapsed; $i++) {
            $depreciation = $currentValue * $rate;
            $currentValue -= $depreciation;

            // Switch to straight-line if needed to avoid depreciation below salvage value
            $remainingYears = $this->useful_life_years - $i - 1;
            $straightLineAmount = ($currentValue - $this->residual_value) / max(1, $remainingYears);

            if ($depreciation < $straightLineAmount && $remainingYears > 0) {
                $currentValue -= $straightLineAmount * $remainingYears;
                break;
            }

            if ($currentValue <= $this->residual_value) {
                $currentValue = $this->residual_value;
                break;
            }
        }

        // Calculate partial year if any
        $partialYear = $yearsElapsed - $fullYearsElapsed;
        if ($partialYear > 0 && $currentValue > $this->residual_value) {
            $partialDepreciation = $currentValue * $rate * $partialYear;
            $currentValue -= $partialDepreciation;
        }

        return max($currentValue, $this->residual_value);
    }

    /**
     * Calculate sum of years digits depreciation value.
     *
     * @param float $yearsElapsed
     * @return float;
     */
    protected function calculateSumOfYearsValue(float $yearsElapsed): float
    {
        $sumOfYears = ($this->useful_life_years * ($this->useful_life_years + 1)) / 2;
        $depreciableValue = $this->initial_value - $this->residual_value;
        $currentValue = $this->initial_value;
        $fullYearsElapsed = floor($yearsElapsed);

        // Calculate for full years
        for ($i = 0; $i < $fullYearsElapsed; $i++) {
            $yearFactor = $this->useful_life_years - $i;
            $depreciation = ($depreciableValue * $yearFactor) / $sumOfYears;
            $currentValue -= $depreciation;

            if ($currentValue <= $this->residual_value) {
                $currentValue = $this->residual_value;
                break;
            }
        }

        // Calculate partial year
        $partialYear = $yearsElapsed - $fullYearsElapsed;
        if ($partialYear > 0 && $currentValue > $this->residual_value) {
            $yearFactor = $this->useful_life_years - $fullYearsElapsed;
            $partialDepreciation = ($depreciableValue * $yearFactor * $partialYear) / $sumOfYears;
            $currentValue -= $partialDepreciation;
        }

        return max($currentValue, $this->residual_value);
    }

    /**
     * Calculate units of production depreciation value.
     *
     * Note: This requires additional data from equipment usage.
     *
     * @return float;
     */
    protected function calculateUnitOfProductionValue(): float
    {
        // This depends on the equipment's actual usage data
        // For now, we'll return the current stored value;
        // In a real implementation, this would use actual usage data from the equipment
        return $this->current_value;
    }

    /**
     * Generate a depreciation schedule for the entire useful life.
     *
     * @return array;
     */
    public function generateDepreciationSchedule(): array
    {
        $schedule = [];
        $startDate = $this->depreciation_start_date->copy();

        for ($year = 1; $year <= $this->useful_life_years; $year++) {
            $endDate = $startDate->copy()->addYear();
            $startValue = $this->calculateCurrentValue($startDate->format('Y-m-d'));
            $endValue = $this->calculateCurrentValue($endDate->format('Y-m-d'));
            $depreciation = $startValue - $endValue;

            $schedule[] = [
                'year' => $year,
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
                'starting_value' => $startValue,
                'ending_value' => $endValue,
                'depreciation_amount' => $depreciation,
                'accumulated_depreciation' => $this->initial_value - $endValue,
                'book_value' => $endValue,
            ];

            $startDate = $endDate;
        }

        $this->depreciation_schedule = $schedule;
        $this->save();

        return $schedule;
    }

    /**
     * Update the equipment's current depreciated value.
     *
     * @return bool;
     */
    public function updateEquipmentDepreciatedValue(): bool
    {
        $equipment = $this->equipment;
        if (!$equipment) {
            return false;
        }

        $currentValue = $this->calculateCurrentValue();
        $isFullyDepreciated = $currentValue <= $this->residual_value;

        // Update the equipment model
        $equipment->depreciated_value = $currentValue;
        $equipment->is_fully_depreciated = $isFullyDepreciated;
        $equipment->last_depreciation_update = Carbon::now();

        if ($isFullyDepreciated && !$this->fully_depreciated_date) {
            $this->fully_depreciated_date = Carbon::now();
            $this->save();
        }

        return $equipment->save();
    }
}




