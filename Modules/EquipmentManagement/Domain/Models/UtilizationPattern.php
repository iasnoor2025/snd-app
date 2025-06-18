<?php

namespace Modules\EquipmentManagement\Domain\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UtilizationPattern extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * Pattern type constants
     */
    const TYPE_DAILY = 'daily';
    const TYPE_WEEKLY = 'weekly';
    const TYPE_MONTHLY = 'monthly';
    const TYPE_SEASONAL = 'seasonal';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'equipment_id',
        'pattern_type',
        'pattern_data',
        'period_start',
        'period_end',
        'average_utilization',
        'peak_utilization',
        'hourly_distribution',
        'daily_distribution',
        'monthly_distribution',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'pattern_data' => 'array',
        'period_start' => 'datetime',
        'period_end' => 'datetime',
        'average_utilization' => 'decimal:2',
        'peak_utilization' => 'decimal:2',
        'hourly_distribution' => 'array',
        'daily_distribution' => 'array',
        'monthly_distribution' => 'array',
    ];

    /**
     * Get the equipment this pattern belongs to.
     */
    public function equipment(): BelongsTo
    {
        return $this->belongsTo(Equipment::class);
    }

    /**
     * Scope a query to only include patterns for a specific equipment.
     */
    public function scopeForEquipment($query, $equipmentId)
    {
        return $query->where('equipment_id', $equipmentId);
    }

    /**
     * Scope a query to only include patterns of a specific type.
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('pattern_type', $type);
    }

    /**
     * Scope a query to only include patterns within a date range.
     */
    public function scopeInPeriod($query, $startDate, $endDate)
    {
        return $query->where(function ($q) use ($startDate, $endDate) {
            $q->whereBetween('period_start', [$startDate, $endDate])
              ->orWhereBetween('period_end', [$startDate, $endDate])
              ->orWhere(function ($innerQ) use ($startDate, $endDate) {
                  $innerQ->where('period_start', '<=', $startDate)
                         ->where('period_end', '>=', $endDate);
              });
        });
    }

    /**
     * Identify the peak hours from the hourly distribution.
     *
     * @param int $topN Number of peak hours to return
     * @return array;
     */
    public function identifyPeakHours(int $topN = 3): array
    {
        if (!$this->hourly_distribution) {
            return [];
        }

        $hours = $this->hourly_distribution;
        arsort($hours); // Sort by value in descending order

        return array_slice($hours, 0, $topN, true);
    }

    /**
     * Identify the peak days from the daily distribution.
     *
     * @param int $topN Number of peak days to return
     * @return array;
     */
    public function identifyPeakDays(int $topN = 3): array
    {
        if (!$this->daily_distribution) {
            return [];
        }

        $days = $this->daily_distribution;
        arsort($days); // Sort by value in descending order

        return array_slice($days, 0, $topN, true);
    }

    /**
     * Identify low utilization periods based on threshold.
     *
     * @param float $threshold The utilization threshold below which periods are considered low
     * @return array;
     */
    public function identifyLowUtilizationPeriods(float $threshold = 30.0): array
    {
        $lowPeriods = [];

        if ($this->pattern_type === self::TYPE_DAILY && $this->hourly_distribution) {
            foreach ($this->hourly_distribution as $hour => $utilization) {
                if ($utilization < $threshold) {
                    $lowPeriods[] = [
                        'period' => "Hour {$hour}",
                        'utilization' => $utilization
                    ];
                }
            }
        } elseif ($this->pattern_type === self::TYPE_WEEKLY && $this->daily_distribution) {
            $dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            foreach ($this->daily_distribution as $day => $utilization) {
                if ($utilization < $threshold) {
                    $lowPeriods[] = [
                        'period' => $dayNames[$day] ?? "Day {$day}",
                        'utilization' => $utilization
                    ];
                }
            }
        } elseif ($this->pattern_type === self::TYPE_MONTHLY && $this->monthly_distribution) {
            foreach ($this->monthly_distribution as $month => $utilization) {
                if ($utilization < $threshold) {
                    $monthName = date('F', mktime(0, 0, 0, $month, 1, date('Y')));
                    $lowPeriods[] = [
                        'period' => $monthName,
                        'utilization' => $utilization
                    ];
                }
            }
        }

        return $lowPeriods;
    }

    /**
     * Compare with a previous pattern to identify trends.
     *
     * @param UtilizationPattern $previousPattern
     * @return array;
     */
    public function compareWithPrevious(UtilizationPattern $previousPattern): array
    {
        if ($this->pattern_type !== $previousPattern->pattern_type) {
            return ['error' => 'Cannot compare patterns of different types'];
        }

        $averageChange = $this->average_utilization - $previousPattern->average_utilization;
        $peakChange = $this->peak_utilization - $previousPattern->peak_utilization;

        $result = [
            'average_change' => $averageChange,
            'average_change_percentage' => $previousPattern->average_utilization > 0 ?
                ($averageChange / $previousPattern->average_utilization) * 100 : 0,
            'peak_change' => $peakChange,
            'peak_change_percentage' => $previousPattern->peak_utilization > 0 ?
                ($peakChange / $previousPattern->peak_utilization) * 100 : 0,
            'is_improving' => $averageChange > 0,
            'detailed_changes' => []
        ];

        // Compare detailed distributions based on pattern type
        if ($this->pattern_type === self::TYPE_DAILY && $this->hourly_distribution && $previousPattern->hourly_distribution) {
            foreach ($this->hourly_distribution as $hour => $value) {
                $prevValue = $previousPattern->hourly_distribution[$hour] ?? 0;
                $change = $value - $prevValue;

                $result['detailed_changes']["hour_{$hour}"] = [
                    'current' => $value,
                    'previous' => $prevValue,
                    'change' => $change,
                    'change_percentage' => $prevValue > 0 ? ($change / $prevValue) * 100 : 0
                ];
            }
        } elseif ($this->pattern_type === self::TYPE_WEEKLY && $this->daily_distribution && $previousPattern->daily_distribution) {
            $dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

            foreach ($this->daily_distribution as $day => $value) {
                $prevValue = $previousPattern->daily_distribution[$day] ?? 0;
                $change = $value - $prevValue;
                $dayName = $dayNames[$day] ?? "day_{$day}";

                $result['detailed_changes'][$dayName] = [
                    'current' => $value,
                    'previous' => $prevValue,
                    'change' => $change,
                    'change_percentage' => $prevValue > 0 ? ($change / $prevValue) * 100 : 0
                ];
            }
        }

        return $result;
    }

    /**
     * Get available pattern type options.
     *
     * @return array;
     */
    public static function getTypeOptions(): array
    {
        return [
            self::TYPE_DAILY => 'Daily',
            self::TYPE_WEEKLY => 'Weekly',
            self::TYPE_MONTHLY => 'Monthly',
            self::TYPE_SEASONAL => 'Seasonal',
        ];
    }
}






