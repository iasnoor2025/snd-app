<?php

namespace Modules\TimesheetManagement\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use Carbon\Carbon;

class WeeklyTimesheet extends Model
{
    use HasFactory;
    use SoftDeletes;
    use LogsActivity;

    protected $fillable = [
        'employee_id',
        'week_start_date',
        'week_end_date',
        'status',
        'total_hours',
        'regular_hours',
        'overtime_hours',
        'notes',
        'submitted_at',
        'approved_by',
        'approved_at',
        'rejected_by',
        'rejected_at',
        'rejection_reason'
    ];

    protected $casts = [
        'week_start_date' => 'date',
        'week_end_date' => 'date',
        'total_hours' => 'decimal:2',
        'regular_hours' => 'decimal:2',
        'overtime_hours' => 'decimal:2',
        'submitted_at' => 'datetime',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime'
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
     * Relation with Employee
     */
    public function employee()
    {
        return $this->belongsTo(\Modules\Employee\Domain\Models\Employee::class);
    }

    /**
     * Relation with time entries
     */
    public function timeEntries()
    {
        return $this->hasMany(TimeEntry::class);
    }

    /**
     * Relation with the user who approved the timesheet
     */
    public function approver()
    {
        return $this->belongsTo(\Modules\Core\Domain\Models\User::class, 'approved_by');
    }

    /**
     * Relation with the user who rejected the timesheet
     */
    public function rejector()
    {
        return $this->belongsTo(\Modules\Core\Domain\Models\User::class, 'rejected_by');
    }

    /**
     * Scope for pending timesheets
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for submitted timesheets
     */
    public function scopeSubmitted($query)
    {
        return $query->where('status', 'submitted');
    }

    /**
     * Scope for approved timesheets
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope for rejected timesheets
     */
    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    /**
     * Scope for timesheets in a date range
     */
    public function scopeInDateRange($query, $startDate, $endDate)
    {
        return $query->where(function ($q) use ($startDate, $endDate) {
            $q->whereBetween('week_start_date', [$startDate, $endDate])
                ->orWhereBetween('week_end_date', [$startDate, $endDate])
                ->orWhere(function ($q2) use ($startDate, $endDate) {
                    $q2->where('week_start_date', '<=', $startDate)
                        ->where('week_end_date', '>=', $endDate);
                });
        });
    }

    /**
     * Get the week number for this timesheet
     */
    public function getWeekNumberAttribute()
    {
        return $this->week_start_date->format('W');
    }

    /**
     * Get the year for this timesheet
     */
    public function getYearAttribute()
    {
        return $this->week_start_date->format('Y');
    }

    /**
     * Get the formatted date range
     */
    public function getDateRangeAttribute()
    {
        return $this->week_start_date->format('M d, Y') . ' - ' . $this->week_end_date->format('M d, Y');
    }

    /**
     * Calculate and update the total hours based on time entries
     */
    public function calculateTotalHours()
    {
        $this->total_hours = $this->timeEntries()->sum('hours');
        $this->regular_hours = $this->timeEntries()->where('is_overtime', false)->sum('hours');
        $this->overtime_hours = $this->timeEntries()->where('is_overtime', true)->sum('hours');

        return $this;
    }

    /**
     * Check if the timesheet is locked (can't be edited)
     */
    public function isLocked()
    {
        return $this->status === 'approved' && config('timesheetmanagement.lock_timesheet_after_approval');
    }

    /**
     * Check if the timesheet is editable
     */
    public function isEditable()
    {
        if ($this->isLocked()) {
            return false;
        }

        // Check if within editable period
        $maxPastDays = config('timesheetmanagement.max_past_days_editable');
        $cutoffDate = Carbon::now()->subDays($maxPastDays);

        return $this->week_end_date->greaterThanOrEqualTo($cutoffDate);
    }
}






