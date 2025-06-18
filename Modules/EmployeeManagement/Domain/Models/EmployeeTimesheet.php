<?php

namespace Modules\EmployeeManagement\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\Core\Domain\Models\BaseModel;
use Modules\Core\Domain\Models\User;

class EmployeeTimesheet extends BaseModel
{
    use SoftDeletes;

    protected $fillable = [
        'employee_id',
        'date',
        'clock_in',
        'clock_out',
        'break_start',
        'break_end',
        'total_hours',
        'regular_hours',
        'overtime_hours',
        'status',
        'notes',
        'approved_by',
        'approved_at',
    ];

    protected $casts = [
        'date' => 'date',
        'clock_in' => 'datetime',
        'clock_out' => 'datetime',
        'break_start' => 'datetime',
        'break_end' => 'datetime',
        'total_hours' => 'decimal:2',
        'regular_hours' => 'decimal:2',
        'overtime_hours' => 'decimal:2',
        'approved_at' => 'datetime',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function getBreakDurationAttribute(): float
    {
        if (!$this->break_start || !$this->break_end) {
            return 0;
        }

        return $this->break_end->diffInMinutes($this->break_start) / 60;
    }

    public function getWorkDurationAttribute(): float
    {
        if (!$this->clock_in || !$this->clock_out) {
            return 0;
        }

        $duration = $this->clock_out->diffInMinutes($this->clock_in) / 60;
        return $duration - $this->break_duration;
    }

    public function getOvertimeAmountAttribute(): float
    {
        if (!$this->employee || !$this->overtime_hours) {
            return 0;
        }

        $hourlyRate = $this->employee->hourly_rate;
        $overtimeMultiplier = config('employee.overtime_multiplier', 1.5);

        return $this->overtime_hours * $hourlyRate * $overtimeMultiplier;
    }

    public function getRegularAmountAttribute(): float
    {
        if (!$this->employee || !$this->regular_hours) {
            return 0;
        }

        return $this->regular_hours * $this->employee->hourly_rate;
    }

    public function getTotalAmountAttribute(): float
    {
        return $this->regular_amount + $this->overtime_amount;
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    public function approve(User $approver): void
    {
        $this->update([
            'status' => 'approved',
            'approved_by' => $approver->id,
            'approved_at' => now(),
        ]);
    }

    public function reject(): void
    {
        $this->update([
            'status' => 'rejected'
        ]);
    }
}






