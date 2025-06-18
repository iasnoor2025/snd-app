<?php

namespace Modules\TimesheetManagement\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class TimeEntry extends Model
{
    use HasFactory;
use SoftDeletes;
use LogsActivity;

    protected $fillable = [
        'weekly_timesheet_id',
        'employee_id',
        'project_id',
        'task_id',
        'date',
        'hours',
        'description',
        'is_overtime',
        'is_billable',
        'start_time',
        'end_time',
        'break_duration',
        'status',
    ];

    protected $casts = [
        'date' => 'date',
        'hours' => 'decimal:2',
        'is_overtime' => 'boolean',
        'is_billable' => 'boolean',
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'break_duration' => 'integer', // in minutes
    ];

    /**
     * Define activity log options
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    /**
     * Relation with WeeklyTimesheet
     */
    public function weeklyTimesheet()
    {
        return $this->belongsTo(WeeklyTimesheet::class);
    }

    /**
     * Relation with Employee
     */
    public function employee()
    {
        return $this->belongsTo(\Modules\Employee\Domain\Models\Employee::class);
    }

    /**
     * Relation with Project
     */
    public function project()
    {
        return $this->belongsTo(\Modules\Project\Domain\Models\Project::class);
    }

    /**
     * Relation with Task
     */
    public function task()
    {
        return $this->belongsTo(\Modules\Project\Domain\Models\Task::class);
    }

    /**
     * Scope for regular time entries (not overtime)
     */
    public function scopeRegular($query)
    {
        return $query->where('is_overtime', false);
    }

    /**
     * Scope for overtime entries
     */
    public function scopeOvertime($query)
    {
        return $query->where('is_overtime', true);
    }

    /**
     * Scope for billable entries
     */
    public function scopeBillable($query)
    {
        return $query->where('is_billable', true);
    }

    /**
     * Scope for entries in a date range
     */
    public function scopeInDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }

    /**
     * Scope for entries for a specific day
     */
    public function scopeForDay($query, $date)
    {
        return $query->whereDate('date', $date);
    }

    /**
     * Calculate hours from start_time, end_time and break_duration
     * This is called when both start_time and end_time are provided instead of direct hours
     */
    public function calculateHours()
    {
        if (!$this->start_time || !$this->end_time) {
            return $this;
        }

        $startTime = $this->start_time;
        $endTime = $this->end_time;
        $breakDuration = $this->break_duration ?? 0;

        // Calculate total minutes
        $totalMinutes = $endTime->diffInMinutes($startTime);

        // Subtract break duration
        $totalMinutes -= $breakDuration;

        // Convert to hours
        $hours = $totalMinutes / 60;

        // Apply time rounding if configured
        if (config('timesheetmanagement.time_rounding.enabled')) {
            $increment = config('timesheetmanagement.time_rounding.increment', 15);
            $method = config('timesheetmanagement.time_rounding.method', 'nearest');

            $fractionalHours = $hours - floor($hours);
            $fractionalMinutes = $fractionalHours * 60;

            // Round minutes according to the configured method
            if ($method === 'up') {
                $roundedMinutes = ceil($fractionalMinutes / $increment) * $increment;
            } elseif ($method === 'down') {
                $roundedMinutes = floor($fractionalMinutes / $increment) * $increment;
            } else { // 'nearest'
                $roundedMinutes = round($fractionalMinutes / $increment) * $increment;
            }

            $hours = floor($hours) + ($roundedMinutes / 60);
        }

        $this->hours = round($hours, 2);

        return $this;
    }

    /**
     * Get the day of week (0 = Sunday, 6 = Saturday)
     */
    public function getDayOfWeekAttribute()
    {
        return $this->date->dayOfWeek;
    }

    /**
     * Get formatted day name
     */
    public function getDayNameAttribute()
    {
        return $this->date->format('l');
    }
}





