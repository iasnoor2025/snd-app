<?php

namespace Modules\EquipmentManagement\Domain\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Spatie\MediaLibrary\HasMedia;
use Spatie\Translatable\HasTranslations;
use App\Traits\HasMediaAttachments;
use App\Traits\AutoLoadsRelations;
use Modules\Core\Domain\Models\Category;
use Modules\Core\Domain\Models\Location;

class Equipment extends Model implements HasMedia
{
    use HasFactory, HasMediaAttachments, AutoLoadsRelations, HasTranslations;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'equipment';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'name',
        'description',
        'unit',
        'default_unit_cost',
        'is_active',
        'model',
        'manufacturer',
        'serial_number',
        'door_number',
        'status',
        'daily_rate',
        'weekly_rate',
        'monthly_rate',
        'purchase_date',
        'purchase_cost',
        'purchase_price',
        'warranty_expiry_date',
        'last_maintenance_date',
        'next_maintenance_date',
        'location_id',
        'category_id',
        'assigned_to',
        'notes',
        'current_operating_hours',
        'current_mileage',
        'current_cycle_count',
        'initial_operating_hours',
        'initial_mileage',
        'initial_cycle_count',
        'last_metric_update',
        'avg_daily_usage_hours',
        'avg_daily_usage_miles',
        'avg_operating_cost_per_hour',
        'avg_operating_cost_per_mile',
        'lifetime_maintenance_cost',
        'efficiency_rating',
        'next_performance_review',
    ];

    /**
     * The attributes that are translatable.
     *
     * @var array
     */
    public $translatable = ['name', 'description'];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'default_unit_cost' => 'decimal:2',
        'is_active' => 'boolean',
        'purchase_date' => 'date',
        'purchase_cost' => 'decimal:2',
        'purchase_price' => 'decimal:2',
        'warranty_expiry_date' => 'date',
        'daily_rate' => 'decimal:2',
        'weekly_rate' => 'decimal:2',
        'monthly_rate' => 'decimal:2',
        'last_maintenance_date' => 'datetime',
        'next_maintenance_date' => 'datetime',
        'current_operating_hours' => 'decimal:2',
        'current_mileage' => 'decimal:2',
        'current_cycle_count' => 'integer',
        'initial_operating_hours' => 'decimal:2',
        'initial_mileage' => 'decimal:2',
        'initial_cycle_count' => 'integer',
        'last_metric_update' => 'datetime',
        'avg_daily_usage_hours' => 'decimal:2',
        'avg_daily_usage_miles' => 'decimal:2',
        'avg_operating_cost_per_hour' => 'decimal:2',
        'avg_operating_cost_per_mile' => 'decimal:2',
        'lifetime_maintenance_cost' => 'decimal:2',
        'efficiency_rating' => 'decimal:2',
        'next_performance_review' => 'datetime',
    ];

    /**
     * Get the rental items for the equipment
     */
    public function rentalItems(): HasMany
    {
        return $this->hasMany(RentalItem::class);
    }

    /**
     * Get the maintenance records for the equipment
     */
    public function maintenanceRecords(): HasMany
    {
        return $this->hasMany(MaintenanceRecord::class);
    }

    /**
     * Get the maintenance schedules for the equipment
     */
    public function maintenanceSchedules(): HasMany
    {
        return $this->hasMany(MaintenanceSchedule::class);
    }

    /**
     * Get the maintenance tasks for the equipment
     */
    public function maintenanceTasks(): HasMany
    {
        return $this->hasMany(MaintenanceTask::class);
    }

    /**
     * Get the metrics records for the equipment
     */
    public function metrics(): HasMany
    {
        return $this->hasMany(EquipmentMetric::class);
    }

    /**
     * Get the cost records for the equipment
     */
    public function costRecords(): HasMany
    {
        return $this->hasMany(EquipmentCostRecord::class);
    }

    /**
     * Check if equipment is available for rent
     */
    public function isAvailable(): bool
    {
        return $this->status === 'available';
    }

    /**
     * Get the location that owns the equipment
     */
    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    /**
     * Get the category that owns the equipment.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function documents(): MorphMany
    {
        return $this->morphMany(Document::class, 'documentable');
    }

    /**
     * Check if equipment is available between two dates
     *
     * @param string $startDate
     * @param string $endDate
     * @return bool;
     */
    public function isAvailableBetween(string $startDate, string $endDate): bool
    {
        // If equipment is not in "available" status, it's not available for rent
        if ($this->status !== 'available') {
            return false;
        }

        // Check if the equipment is already rented in this period
        $isRented = $this->rentalItems()
            ->whereHas('rental', function ($query) use ($startDate, $endDate) {
                $query->whereIn('status', ['pending', 'active'])
                    ->where(function ($q) use ($startDate, $endDate) {
                        // Rental starts during the requested period
                        $q->whereBetween('start_date', [$startDate, $endDate])
                        // Rental ends during the requested period
                        ->orWhereBetween('expected_end_date', [$startDate, $endDate])
                        // Rental starts before and ends after the requested period
                        ->orWhere(function ($q2) use ($startDate, $endDate) {
                            $q2->where('start_date', '<=', $startDate)
                               ->where('expected_end_date', '>=', $endDate);
                        });
                    });
            })
            ->exists();

        return !$isRented;
    }

    /**
     * Get the project equipment entries for this equipment.
     */
    public function projectEquipment(): HasMany
    {
        return $this->hasMany(ProjectEquipment::class);
    }

    /**
     * Scope a query to only include active equipment.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Get the latest metric record for this equipment.
     *
     * @return EquipmentMetric|null;
     */
    public function getLatestMetric()
    {
        return $this->metrics()->latest('recorded_at')->first();
    }

    /**
     * Record new metrics for this equipment.
     *
     * @param array $data
     * @param int|null $userId
     * @return EquipmentMetric;
     */
    public function recordMetrics(array $data, ?int $userId = null)
    {
        $data['equipment_id'] = $this->id;
        $data['recorded_at'] = $data['recorded_at'] ?? now();
        $data['recorded_by'] = $userId;

        $metric = EquipmentMetric::create($data);

        // Update equipment current metrics
        $this->updateCurrentMetrics($data);

        return $metric;
    }

    /**
     * Update the equipment's current metrics.
     *
     * @param array $data
     * @return bool;
     */
    public function updateCurrentMetrics(array $data)
    {
        $updates = [
            'last_metric_update' => now()
        ];

        if (isset($data['operating_hours'])) {
            $updates['current_operating_hours'] = $data['operating_hours'];
        }

        if (isset($data['mileage'])) {
            $updates['current_mileage'] = $data['mileage'];
        }

        if (isset($data['cycle_count'])) {
            $updates['current_cycle_count'] = $data['cycle_count'];
        }

        return $this->update($updates);
    }

    /**
     * Record a cost for this equipment.
     *
     * @param array $data
     * @param int|null $userId
     * @return EquipmentCostRecord;
     */
    public function recordCost(array $data, ?int $userId = null)
    {
        $data['equipment_id'] = $this->id;
        $data['date'] = $data['date'] ?? now();
        $data['created_by'] = $userId;
        $data['updated_by'] = $userId;

        // Include current metrics if not provided
        if (!isset($data['operating_hours']) && $this->current_operating_hours) {
            $data['operating_hours'] = $this->current_operating_hours;
        }

        if (!isset($data['mileage']) && $this->current_mileage) {
            $data['mileage'] = $this->current_mileage;
        }

        $costRecord = EquipmentCostRecord::create($data);

        // Update lifetime maintenance cost if this is a maintenance cost
        if (in_array($data['cost_type'], [
            EquipmentCostRecord::TYPE_MAINTENANCE,
            EquipmentCostRecord::TYPE_REPAIR,
            EquipmentCostRecord::TYPE_PART
        ])) {
            $this->updateLifetimeMaintenanceCost();
        }

        // Update average operating costs
        if ($data['cost_type'] === EquipmentCostRecord::TYPE_OPERATING || $data['cost_type'] === EquipmentCostRecord::TYPE_FUEL) {
            $this->updateOperatingCosts();
        }

        return $costRecord;
    }

    /**
     * Update the lifetime maintenance cost for this equipment.
     *
     * @return bool;
     */
    public function updateLifetimeMaintenanceCost()
    {
        $maintenanceCost = $this->costRecords()
            ->whereIn('cost_type', [
                EquipmentCostRecord::TYPE_MAINTENANCE,
                EquipmentCostRecord::TYPE_REPAIR,
                EquipmentCostRecord::TYPE_PART
            ])
            ->sum('amount');

        return $this->update([
            'lifetime_maintenance_cost' => $maintenanceCost,
        ]);
    }

    /**
     * Update the average operating costs per hour and per mile.
     *
     * @return bool;
     */
    public function updateOperatingCosts()
    {
        // Get operating costs
        $operatingCosts = $this->costRecords()
            ->whereIn('cost_type', [
                EquipmentCostRecord::TYPE_OPERATING,
                EquipmentCostRecord::TYPE_FUEL
            ]);

        $totalCost = $operatingCosts->sum('amount');

        // Get total hours for valid records
        $hoursRecords = $operatingCosts->whereNotNull('operating_hours')
            ->where('operating_hours', '>', 0)
            ->get();

        $totalHours = 0;
        foreach ($hoursRecords as $record) {
            $totalHours += $record->operating_hours;
        }

        // Get total miles for valid records
        $milesRecords = $operatingCosts->whereNotNull('mileage')
            ->where('mileage', '>', 0)
            ->get();

        $totalMiles = 0;
        foreach ($milesRecords as $record) {
            $totalMiles += $record->mileage;
        }

        // Calculate averages
        $avgCostPerHour = $totalHours > 0 ? $totalCost / $totalHours : null;
        $avgCostPerMile = $totalMiles > 0 ? $totalCost / $totalMiles : null;

        return $this->update([
            'avg_operating_cost_per_hour' => $avgCostPerHour,
            'avg_operating_cost_per_mile' => $avgCostPerMile,
        ]);
    }

    /**
     * Calculate usage statistics for this equipment.
     *
     * @param int $days Number of days to consider for average calculation
     * @return bool;
     */
    public function calculateUsageStatistics(int $days = 30)
    {
        $startDate = Carbon::now()->subDays($days);

        // Get metrics within date range
        $metrics = $this->metrics()
            ->where('recorded_at', '>=', $startDate)
            ->orderBy('recorded_at')
            ->get();

        if ($metrics->count() < 2) {
            return false; // Not enough data for calculation;
        }

        // Calculate daily averages
        $firstMetric = $metrics->first();
        $lastMetric = $metrics->last();
        $daysDiff = $firstMetric->recorded_at->diffInDays($lastMetric->recorded_at) ?: 1; // Avoid division by zero

        // Hours difference
        $hoursDiff = isset($firstMetric->operating_hours) && isset($lastMetric->operating_hours)
            ? $lastMetric->operating_hours - $firstMetric->operating_hours
            : null;

        // Miles difference
        $milesDiff = isset($firstMetric->mileage) && isset($lastMetric->mileage)
            ? $lastMetric->mileage - $firstMetric->mileage
            : null;

        // Calculate averages
        $avgDailyHours = $hoursDiff !== null ? $hoursDiff / $daysDiff : null;
        $avgDailyMiles = $milesDiff !== null ? $milesDiff / $daysDiff : null;

        return $this->update([
            'avg_daily_usage_hours' => $avgDailyHours,
            'avg_daily_usage_miles' => $avgDailyMiles,
        ]);
    }

    /**
     * Calculate the efficiency rating for this equipment.
     *
     * @return float|null;
     */
    public function calculateEfficiencyRating()
    {
        // This is a placeholder calculation - in a real system, this would be more complex
        // based on multiple factors like fuel consumption, downtime, maintenance costs, etc.

        $latestMetric = $this->getLatestMetric();

        if (!$latestMetric || !$latestMetric->efficiency_rating) {
            return null;
        }

        // Factor 1: Latest efficiency metric (50%)
        $factor1 = $latestMetric->efficiency_rating * 0.5;

        // Factor 2: Maintenance cost ratio (25%)
        // Lower maintenance cost relative to operating hours is better
        $operatingHours = $this->current_operating_hours ?: 1; // Avoid division by zero
        $maintenanceCostPerHour = $this->lifetime_maintenance_cost / $operatingHours;

        // Assume a benchmark of $5 per hour, adjust as needed
        $benchmarkCostPerHour = 5;
        $costRatio = min(1, $benchmarkCostPerHour / ($maintenanceCostPerHour ?: $benchmarkCostPerHour)); // 1 is best, lower is worse
        $factor2 = $costRatio * 25; // 25% weight

        // Factor 3: Downtime ratio (25%)
        // Get percentage of time the equipment has been operational
        $downtimeHours = $this->metrics()
            ->whereNotNull('downtime_hours')
            ->sum('downtime_hours');

        $totalPossibleHours = max(1, $this->created_at->diffInHours(now())); // Avoid division by zero
        $operationalRatio = min(1, 1 - ($downtimeHours / $totalPossibleHours)); // 1 is best, lower is worse
        $factor3 = $operationalRatio * 25; // 25% weight

        // Calculate total efficiency
        $efficiencyRating = $factor1 + $factor2 + $factor3;

        // Update and return
            $this->update([
            'efficiency_rating' => $efficiencyRating,
        ]);

        return $efficiencyRating;
    }

    /**
     * Get the total lifetime usage of this equipment.
     *
     * @return array;
     */
    public function getLifetimeUsage()
    {
        return [
            'operating_hours' => $this->initial_operating_hours !== null && $this->current_operating_hours !== null
                ? $this->current_operating_hours - $this->initial_operating_hours
                : null,
            'mileage' => $this->initial_mileage !== null && $this->current_mileage !== null
                ? $this->current_mileage - $this->initial_mileage
                : null,
            'cycles' => $this->initial_cycle_count !== null && $this->current_cycle_count !== null
                ? $this->current_cycle_count - $this->initial_cycle_count
                : null,
        ];
    }

    /**
     * Get maintenance cost per operating hour.
     *
     * @return float|null;
     */
    public function getMaintenanceCostPerHour()
    {
        if (!$this->lifetime_maintenance_cost || !$this->current_operating_hours) {
            return null;
        }

        $lifetimeHours = $this->initial_operating_hours !== null
            ? $this->current_operating_hours - $this->initial_operating_hours
            : $this->current_operating_hours;

        if ($lifetimeHours <= 0) {
            return null;
        }

        return $this->lifetime_maintenance_cost / $lifetimeHours;
    }

    /**
     * Get the total cost of ownership (TCO).
     *
     * @return float|null;
     */
    public function getTotalCostOfOwnership()
    {
        if (!$this->purchase_cost) {
            return null;
        }

        $operatingCosts = $this->costRecords()->sum('amount');

        return $this->purchase_cost + $operatingCosts;
    }

    /**
     * Get the utilization logs for the equipment
     */
    public function utilizationLogs(): HasMany
    {
        return $this->hasMany(EquipmentUtilizationLog::class);
    }

    /**
     * Get the utilization patterns for the equipment
     */
    public function utilizationPatterns(): HasMany
    {
        return $this->hasMany(UtilizationPattern::class);
    }

    /**
     * Get the current active utilization log if any
     */
    public function activeUtilizationLog()
    {
        return $this->utilizationLogs()
            ->whereNull('end_time')
            ->orderBy('start_time', 'desc')
            ->first();
    }

    /**
     * Calculate utilization rate for a given period
     *
     * @param int $days Number of days to consider
     * @return float|null;
     */
    public function calculateUtilizationRate(int $days = 30): ?float
    {
        $startDate = Carbon::now()->subDays($days);
        $endDate = Carbon::now();

        // Get total available time in hours (days * 24)
        $totalAvailableHours = $days * 24;

        // Get actual utilization hours
        $utilizationLogs = $this->utilizationLogs()
            ->where('status', EquipmentUtilizationLog::STATUS_ACTIVE)
            ->inDateRange($startDate, $endDate)
            ->get();

        if ($utilizationLogs->isEmpty()) {
            return 0;
        }

        $totalUtilizedHours = 0;

        foreach ($utilizationLogs as $log) {
            $logStart = max($log->start_time, $startDate);
            $logEnd = $log->end_time ?? Carbon::now();
            $logEnd = min($logEnd, $endDate);

            // Calculate hours for this log
            $hours = $logStart->diffInMinutes($logEnd) / 60;
            $totalUtilizedHours += $hours;
        }

        // Calculate utilization rate as percentage
        $utilizationRate = ($totalAvailableHours > 0) ?
            ($totalUtilizedHours / $totalAvailableHours) * 100 : 0;

        return round($utilizationRate, 2);
    }

    /**
     * Identify idle periods within a given time range
     *
     * @param int $days Number of days to consider
     * @return array;
     */
    public function identifyIdlePeriods(int $days = 30): array
    {
        $startDate = Carbon::now()->subDays($days);
        $endDate = Carbon::now();

        // Get all utilization logs in the period
        $logs = $this->utilizationLogs()
            ->inDateRange($startDate, $endDate)
            ->orderBy('start_time')
            ->get();

        if ($logs->isEmpty()) {
            // If no logs, the entire period is idle
            return [
                [
                    'start' => $startDate,
                    'end' => $endDate,
                    'duration_hours' => $startDate->diffInHours($endDate),
                    'notes' => 'No activity recorded'
                ]
            ];
        }

        $idlePeriods = [];
        $currentDate = $startDate->copy();

        foreach ($logs as $log) {
            // If there's a gap between current date and log start, it's an idle period
            if ($currentDate->lt($log->start_time)) {
                $idlePeriods[] = [
                    'start' => $currentDate->copy(),
                    'end' => $log->start_time,
                    'duration_hours' => $currentDate->diffInHours($log->start_time),
                    'notes' => 'Equipment idle'
                ];
            }

            // Move current date to the end of this log (or now if log is active)
            $currentDate = $log->end_time ?? Carbon::now();
        }

        // Check if there's an idle period after the last log
        if ($currentDate->lt($endDate)) {
            $idlePeriods[] = [
                'start' => $currentDate->copy(),
                'end' => $endDate,
                'duration_hours' => $currentDate->diffInHours($endDate),
                'notes' => 'Equipment idle'
            ];
        }

        return $idlePeriods;
    }

    /**
     * Update utilization statistics for this equipment
     *
     * @return bool;
     */
    public function updateUtilizationStatistics(): bool
    {
        // Calculate current utilization rate (last 30 days)
        $this->current_utilization_rate = $this->calculateUtilizationRate(30);

        // Calculate average daily utilization (last 90 days)
        $this->avg_daily_utilization = $this->calculateUtilizationRate(90) ?: $this->current_utilization_rate;

        // Calculate average weekly utilization (last 180 days)
        $this->avg_weekly_utilization = $this->calculateUtilizationRate(180) ?: $this->avg_daily_utilization;

        // Calculate average monthly utilization (last 365 days)
        $this->avg_monthly_utilization = $this->calculateUtilizationRate(365) ?: $this->avg_weekly_utilization;

        // Identify idle periods and count them
        $idlePeriods = $this->identifyIdlePeriods(90);
        $this->idle_periods_count = count($idlePeriods);

        // Calculate total idle days
        $totalIdleHours = 0;
        foreach ($idlePeriods as $period) {
            $totalIdleHours += $period['duration_hours'];
        }
        $this->total_idle_days = round($totalIdleHours / 24, 1);

        // Update timestamp
        $this->last_utilization_update = Carbon::now();

        return $this->save();
    }

    /**
     * Start a new utilization log for this equipment
     *
     * @param array $data
     * @param int|null $userId
     * @return EquipmentUtilizationLog;
     */
    public function startUtilization(array $data, ?int $userId = null): EquipmentUtilizationLog
    {
        // End any active utilization logs first
        $activeLog = $this->activeUtilizationLog();
        if ($activeLog) {
            $activeLog->endUtilization();
        }

        // Create new utilization log
        $log = new EquipmentUtilizationLog();
        $log->equipment_id = $this->id;
        $log->start_time = $data['start_time'] ?? Carbon::now();
        $log->status = $data['status'] ?? EquipmentUtilizationLog::STATUS_ACTIVE;
        $log->project_id = $data['project_id'] ?? null;
        $log->rental_id = $data['rental_id'] ?? null;
        $log->location = $data['location'] ?? null;
        $log->notes = $data['notes'] ?? null;
        $log->created_by = $userId;
        $log->save();

        // Update equipment status
        $this->status = $data['equipment_status'] ?? 'in_use';
        $this->save();

        return $log;
    }

    /**
     * End an active utilization log for this equipment
     *
     * @param array $data
     * @param int|null $userId
     * @return EquipmentUtilizationLog|null;
     */
    public function endUtilization(array $data = [], ?int $userId = null): ?EquipmentUtilizationLog
    {
        $activeLog = $this->activeUtilizationLog();

        if (!$activeLog) {
            return null;
        }

        // Update log data if provided
        if (!empty($data['notes'])) {
            $activeLog->notes = $data['notes'];
        }

        // End the utilization
        $endTime = $data['end_time'] ?? Carbon::now();
        $activeLog->endUtilization($endTime);

        // Update equipment status
        $this->status = $data['equipment_status'] ?? 'available';
        $this->save();

        // Update utilization statistics
        $this->updateUtilizationStatistics();

        return $activeLog;
    }

    /**
     * Check if equipment is currently in use
     *
     * @return bool;
     */
    public function isInUse(): bool
    {
        return $this->activeUtilizationLog() !== null;
    }

    /**
     * Get the depreciation record for the equipment
     */
    public function depreciation()
    {
        return $this->hasOne(EquipmentDepreciation::class);
    }

    /**
     * Get the valuation records for the equipment
     */
    public function valuationRecords()
    {
        return $this->hasMany(EquipmentValuationRecord::class);
    }

    /**
     * Get the most recent valuation record
     */
    public function latestValuation()
    {
        return $this->valuationRecords()->latest('valuation_date')->first();
    }

    /**
     * Calculate annual depreciation amount
     *
     * @return float|null;
     */
    public function calculateAnnualDepreciationAmount()
    {
        $depreciation = $this->depreciation;
        if (!$depreciation || !$this->purchase_cost) {
            return null;
        }

        return $depreciation->annual_depreciation_amount;
    }

    /**
     * Get remaining useful life in years
     *
     * @return float|null;
     */
    public function getRemainingUsefulLife()
    {
        $depreciation = $this->depreciation;
        if (!$depreciation || $this->is_fully_depreciated) {
            return 0;
        }

        $startDate = $depreciation->depreciation_start_date;
        $originalUsefulLife = $depreciation->useful_life_years;
        $endDate = $startDate->copy()->addYears($originalUsefulLife);

        $today = now();
        if ($today >= $endDate) {
            return 0;
        }

        return $endDate->diffInDays($today) / 365.25;
    }

    /**
     * Calculate replacement cost
     *
     * @return float|null;
     */
    public function calculateReplacementCost()
    {
        if ($this->replacement_cost_estimate) {
            return $this->replacement_cost_estimate;
        }

        // If no explicit estimate, we can use a simple inflation model
        if ($this->purchase_cost) {
            $purchaseDate = $this->purchase_date ?? $this->created_at;
            $yearsSincePurchase = now()->diffInDays($purchaseDate) / 365.25;

            // Assume 3% annual inflation
            $inflationFactor = pow(1.03, $yearsSincePurchase);
            return $this->purchase_cost * $inflationFactor;
        }

        return null;
    }

    /**
     * Calculate depreciation rate
     *
     * @return float|null;
     */
    public function calculateDepreciationRate()
    {
        $depreciation = $this->depreciation;
        if (!$depreciation) {
            return null;
        }

        return $depreciation->annual_depreciation_rate;
    }

    /**
     * Get estimated salvage value
     *
     * @return float|null;
     */
    public function getEstimatedSalvageValue()
    {
        $depreciation = $this->depreciation;
        if (!$depreciation) {
            return null;
        }

        return $depreciation->residual_value;
    }

    /**
     * Determine if equipment should be considered for replacement
     *
     * @return bool;
     */
    public function shouldConsiderReplacement()
    {
        // Equipment should be considered for replacement if:
        // 1. It's fully depreciated, or
        // 2. It has less than 1 year of useful life remaining, or
        // 3. Its maintenance costs exceed a threshold of its purchase cost

        if ($this->is_fully_depreciated) {
            return true;
        }

        if ($this->getRemainingUsefulLife() < 1) {
            return true;
        }

        if ($this->lifetime_maintenance_cost && $this->purchase_cost) {
            $maintenanceCostRatio = $this->lifetime_maintenance_cost / $this->purchase_cost;
            if ($maintenanceCostRatio > 0.5) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get a book-to-market value ratio
     *
     * @return float|null;
     */
    public function getBookToMarketRatio()
    {
        if (!$this->depreciated_value) {
            return null;
        }

        $latestValuation = $this->latestValuation();
        if (!$latestValuation) {
            return null;
        }

        return $this->depreciated_value / $latestValuation->valuation_amount;
    }
}






