<?php

namespace Modules\EquipmentManagement\Domain\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class EquipmentUtilizationLog extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * Status constants
     */
    const STATUS_ACTIVE = 'active';
    const STATUS_IDLE = 'idle';
    const STATUS_STANDBY = 'standby';
    const STATUS_MAINTENANCE = 'maintenance';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'equipment_id',
        'start_time',
        'end_time',
        'status',
        'project_id',
        'rental_id',
        'location',
        'hours_logged',
        'notes',
        'created_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'hours_logged' => 'decimal:2',
    ];

    /**
     * Get the equipment this utilization log belongs to.
     */
    public function equipment(): BelongsTo
    {
        return $this->belongsTo(Equipment::class);
    }

    /**
     * Get the project this utilization log is associated with.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the rental this utilization log is associated with.
     */
    public function rental(): BelongsTo
    {
        return $this->belongsTo(Rental::class);
    }

    /**
     * Get the user who created this log.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Check if the utilization log is currently active (no end time).
     *
     * @return bool;
     */
    public function isActive(): bool
    {
        return $this->end_time === null;
    }

    /**
     * Calculate the hours logged based on start and end time.
     *
     * @return float|null;
     */
    public function calculateHours(): ?float
    {
        if (!$this->start_time) {
            return null;
        }

        $end = $this->end_time ?? Carbon::now();

        // Calculate the difference in hours
        $hours = $this->start_time->diffInMinutes($end) / 60;

        return round($hours, 2);
    }

    /**
     * Update the hours logged based on start and end time.
     *
     * @return bool;
     */
    public function updateHoursLogged(): bool
    {
        $this->hours_logged = $this->calculateHours();
        return $this->save();
    }

    /**
     * Scope a query to only include active utilization logs.
     */
    public function scopeActive($query)
    {
        return $query->whereNull('end_time');
    }

    /**
     * Scope a query to only include logs for a specific equipment.
     */
    public function scopeForEquipment($query, $equipmentId)
    {
        return $query->where('equipment_id', $equipmentId);
    }

    /**
     * Scope a query to only include logs within a date range.
     */
    public function scopeInDateRange($query, $startDate, $endDate)
    {
        return $query->where(function ($q) use ($startDate, $endDate) {
            // Logs that start within the date range
            $q->whereBetween('start_time', [$startDate, $endDate])
            // Or logs that end within the date range
            ->orWhereBetween('end_time', [$startDate, $endDate])
            // Or logs that span the entire date range
            ->orWhere(function ($innerQ) use ($startDate, $endDate) {
                $innerQ->where('start_time', '<=', $startDate)
                       ->where(function ($innerQ2) use ($endDate) {
                           $innerQ2->where('end_time', '>=', $endDate)
                                  ->orWhereNull('end_time');
                       });
            });
        });
    }

    /**
     * Scope a query to only include logs with a specific status.
     */
    public function scopeWithStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Get available status options.
     *
     * @return array;
     */
    public static function getStatusOptions(): array
    {
        return [
            self::STATUS_ACTIVE => 'Active',
            self::STATUS_IDLE => 'Idle',
            self::STATUS_STANDBY => 'Standby',
            self::STATUS_MAINTENANCE => 'Maintenance',
        ];
    }

    /**
     * End the current utilization log.
     *
     * @param Carbon|null $endTime
     * @return bool;
     */
    public function endUtilization(?Carbon $endTime = null): bool
    {
        if (!$this->isActive()) {
            return false;
        }

        $this->end_time = $endTime ?? Carbon::now();
        $this->hours_logged = $this->calculateHours();

        return $this->save();
    }
}






