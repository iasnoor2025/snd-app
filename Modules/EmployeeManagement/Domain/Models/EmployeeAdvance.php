<?php

namespace Modules\EmployeeManagement\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\Core\Domain\Models\BaseModel;
use Modules\Core\Domain\Models\User;

class EmployeeAdvance extends BaseModel
{
    use SoftDeletes;

    protected $fillable = [
        'employee_id',
        'amount',
        'reason',
        'status',
        'approved_by',
        'approved_at',
        'rejected_by',
        'rejected_at',
        'rejection_reason',
        'payment_date',
        'deduction_start_date',
        'deduction_end_date',
        'deduction_amount',
        'deduction_frequency',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'deduction_amount' => 'decimal:2',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
        'payment_date' => 'date',
        'deduction_start_date' => 'date',
        'deduction_end_date' => 'date',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function rejecter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rejected_by');
    }

    public function getIsApprovedAttribute(): bool
    {
        return $this->status === 'approved';
    }

    public function getIsRejectedAttribute(): bool
    {
        return $this->status === 'rejected';
    }

    public function getIsPendingAttribute(): bool
    {
        return $this->status === 'pending';
    }

    public function getIsPaidAttribute(): bool
    {
        return $this->amount - $this->repaid_amount <= 0;
    }

    public function getTotalDeductionsAttribute(): float
    {
        return $this->amount - $this->repaid_amount;
    }

    public function getRemainingDeductionsAttribute(): int
    {
        if (!$this->deduction_amount || $this->deduction_amount <= 0) {
            return 0;
        }

        return ceil(($this->amount - $this->repaid_amount) / $this->deduction_amount);
    }

    public function getNextDeductionDateAttribute(): ?string
    {
        if ($this->is_paid || !$this->deduction_start_date || !$this->deduction_frequency) {
            return null;
        }

        $lastDeductionDate = $this->deduction_start_date;
        $remainingDeductions = $this->remaining_deductions;

        if ($remainingDeductions <= 0) {
            return null;
        }

        switch ($this->deduction_frequency) {
            case 'weekly':
                return $lastDeductionDate->addWeeks($remainingDeductions)->format('Y-m-d');
            case 'biweekly':
                return $lastDeductionDate->addWeeks($remainingDeductions * 2)->format('Y-m-d');
            case 'monthly':
                return $lastDeductionDate->addMonths($remainingDeductions)->format('Y-m-d');
            default:
                return null;
        }
    }
}






