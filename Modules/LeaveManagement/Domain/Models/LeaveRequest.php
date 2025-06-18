<?php

namespace Modules\LeaveManagement\Domain\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class LeaveRequest extends Model
{
    use HasFactory;
    use SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'employee_id',
        'leave_type',
        'start_date',
        'end_date',
        'reason',
        'notes',
        'status',
        'approved_by',
        'approved_at',
        'return_date',
        'returned_by',
        'returned_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'approved_at' => 'datetime',
        'return_date' => 'date',
        'returned_at' => 'datetime',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = ['is_overdue_for_return'];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        // When a leave request is approved, update employee status to on_leave
        static::updated(function ($leaveRequest) {
            if ($leaveRequest->isDirty('status') && $leaveRequest->status === 'approved') {
                $leaveRequest->employee->update(['status' => 'on_leave']);
            }
        });

        // When a leave request is marked as returned, update employee status to active
        static::updated(function ($leaveRequest) {
            if ($leaveRequest->isDirty('return_date') && $leaveRequest->return_date) {
                $leaveRequest->employee->update(['status' => 'active']);
            }
        });
    }

    /**
     * Get the employee that owns the leave request
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * Get the user who approved/rejected the leave request
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get the user who marked the return
     */
    public function returner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'returned_by');
    }

    /**
     * Calculate the number of days for the leave request
     */
    public function getDaysCountAttribute(): int
    {
        return $this->start_date->diffInDays($this->end_date) + 1;
    }

    /**
     * Check if the leave request is overdue for return
     */
    public function getIsOverdueForReturnAttribute(): bool
    {
        return $this->status === 'approved'
            && !$this->return_date
            && $this->end_date->isPast();
    }

    /**
     * Check if the employee has returned from leave
     */
    public function hasReturned(): bool
    {
        return !is_null($this->return_date);
    }
}




