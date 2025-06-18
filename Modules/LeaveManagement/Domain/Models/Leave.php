<?php

namespace Modules\LeaveManagement\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Leave extends Model
{
    use HasFactory;
    use SoftDeletes;
    use LogsActivity;

    protected $fillable = [
        'employee_id',
        'leave_type_id',
        'start_date',
        'end_date',
        'half_day',
        'reason',
        'status',
        'approved_by',
        'rejected_by',
        'rejection_reason',
        'attachments',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'half_day' => 'boolean',
        'attachments' => 'array',
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
     * Calculate the number of leave days
     *
     * @return float
     */
    public function getDaysCountAttribute(): float
    {
        if ($this->half_day) {
            return 0.5;
        }

        $start = $this->start_date;
        $end = $this->end_date;

        $days = $start->diffInDaysFiltered(function ($date) {
            return !$date->isWeekend(); // Skip weekends
        }, $end) + 1; // +1 to include the end date

        return $days;
    }

    /**
     * Relation with Employee
     */
    public function employee()
    {
        return $this->belongsTo(\Modules\Employee\Domain\Models\Employee::class);
    }

    /**
     * Relation with LeaveType
     */
    public function leaveType()
    {
        return $this->belongsTo(LeaveType::class);
    }

    /**
     * Relation with the user who approved the leave
     */
    public function approver()
    {
        return $this->belongsTo(\Modules\Core\Domain\Models\User::class, 'approved_by');
    }

    /**
     * Relation with the user who rejected the leave
     */
    public function rejector()
    {
        return $this->belongsTo(\Modules\Core\Domain\Models\User::class, 'rejected_by');
    }

    /**
     * Scope for pending leaves
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for approved leaves
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope for rejected leaves
     */
    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    /**
     * Scope for leaves in a date range
     */
    public function scopeInDateRange($query, $startDate, $endDate)
    {
        return $query->where(function ($q) use ($startDate, $endDate) {
            $q->whereBetween('start_date', [$startDate, $endDate])
                ->orWhereBetween('end_date', [$startDate, $endDate])
                ->orWhere(function ($q2) use ($startDate, $endDate) {
                    $q2->where('start_date', '<=', $startDate)
                        ->where('end_date', '>=', $endDate);
                });
        });
    }
}






