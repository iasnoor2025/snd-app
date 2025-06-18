<?php

namespace Modules\EmployeeManagement\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\Core\Domain\Models\BaseModel;
use Modules\Core\Domain\Models\User;
use Carbon\Carbon;

class SalaryIncrement extends BaseModel
{
    use SoftDeletes;

    protected $fillable = [
        'employee_id',
        'current_base_salary',
        'new_base_salary',
        'current_food_allowance',
        'new_food_allowance',
        'current_housing_allowance',
        'new_housing_allowance',
        'current_transport_allowance',
        'new_transport_allowance',
        'increment_type',
        'increment_percentage',
        'increment_amount',
        'reason',
        'effective_date',
        'requested_by',
        'requested_at',
        'approved_by',
        'approved_at',
        'rejected_by',
        'rejected_at',
        'rejection_reason',
        'status',
        'notes',
    ];

    protected $casts = [
        'current_base_salary' => 'decimal:2',
        'new_base_salary' => 'decimal:2',
        'current_food_allowance' => 'decimal:2',
        'new_food_allowance' => 'decimal:2',
        'current_housing_allowance' => 'decimal:2',
        'new_housing_allowance' => 'decimal:2',
        'current_transport_allowance' => 'decimal:2',
        'new_transport_allowance' => 'decimal:2',
        'increment_percentage' => 'decimal:2',
        'increment_amount' => 'decimal:2',
        'effective_date' => 'date',
        'requested_at' => 'datetime',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
    ];

    protected $appends = [
        'current_total_salary',
        'new_total_salary',
        'total_increment_amount',
        'actual_increment_percentage',
    ];

    const STATUS_PENDING = 'pending';
    const STATUS_APPROVED = 'approved';
    const STATUS_REJECTED = 'rejected';
    const STATUS_APPLIED = 'applied';

    const TYPE_PERCENTAGE = 'percentage';
    const TYPE_AMOUNT = 'amount';
    const TYPE_PROMOTION = 'promotion';
    const TYPE_ANNUAL_REVIEW = 'annual_review';
    const TYPE_PERFORMANCE = 'performance';
    const TYPE_MARKET_ADJUSTMENT = 'market_adjustment';

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function rejectedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rejected_by');
    }

    // Calculated attributes
    public function getCurrentTotalSalaryAttribute(): float
    {
        return $this->current_base_salary +
            $this->current_food_allowance +
            $this->current_housing_allowance +
            $this->current_transport_allowance;
    }

    public function getNewTotalSalaryAttribute(): float
    {
        return $this->new_base_salary +
            $this->new_food_allowance +
            $this->new_housing_allowance +
            $this->new_transport_allowance;
    }

    public function getTotalIncrementAmountAttribute(): float
    {
        return $this->new_total_salary - $this->current_total_salary;
    }

    public function getActualIncrementPercentageAttribute(): float
    {
        if ($this->current_total_salary == 0 || $this->current_total_salary === null) {
            return 0;
        }

        return (($this->new_total_salary - $this->current_total_salary) / $this->current_total_salary) * 100;
    }

    // Status check methods
    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function isApproved(): bool
    {
        return $this->status === self::STATUS_APPROVED;
    }

    public function isRejected(): bool
    {
        return $this->status === self::STATUS_REJECTED;
    }

    public function isApplied(): bool
    {
        return $this->status === self::STATUS_APPLIED;
    }

    public function canBeApproved(): bool
    {
        return $this->isPending() && $this->effective_date >= now()->toDateString();
    }

    public function canBeRejected(): bool
    {
        return $this->isPending();
    }

    public function canBeApplied(): bool
    {
        return $this->isApproved() && $this->effective_date <= now()->toDateString();
    }

    // Action methods
    public function approve(User $approver): void
    {
        $this->update([
            'status' => self::STATUS_APPROVED,
            'approved_by' => $approver->id,
            'approved_at' => now(),
        ]);
    }

    public function reject(User $rejector, string $reason = null): void
    {
        $this->update([
            'status' => self::STATUS_REJECTED,
            'rejected_by' => $rejector->id,
            'rejected_at' => now(),
            'rejection_reason' => $reason,
        ]);
    }

    public function apply(): void
    {
        if (!$this->canBeApplied()) {
            throw new \Exception('Salary increment cannot be applied at this time.');
        }

        // Create new salary record
        $this->employee->salaries()->create([
            'base_salary' => $this->new_base_salary,
            'food_allowance' => $this->new_food_allowance,
            'housing_allowance' => $this->new_housing_allowance,
            'transport_allowance' => $this->new_transport_allowance,
            'effective_from' => $this->effective_date,
            'reason' => "Salary increment: {$this->reason}",
            'approved_by' => $this->approved_by,
            'approved_at' => now(),
            'status' => 'approved',
        ]);

        // Update employee's basic salary
        $this->employee->update([
            'basic_salary' => $this->new_base_salary,
        ]);

        // Mark increment as applied
        $this->update([
            'status' => self::STATUS_APPLIED,
        ]);
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function scopeApproved($query)
    {
        return $query->where('status', self::STATUS_APPROVED);
    }

    public function scopeRejected($query)
    {
        return $query->where('status', self::STATUS_REJECTED);
    }

    public function scopeApplied($query)
    {
        return $query->where('status', self::STATUS_APPLIED);
    }

    public function scopeEffectiveToday($query)
    {
        return $query->where('effective_date', '<=', now()->toDateString());
    }

    public function scopeForEmployee($query, $employeeId)
    {
        return $query->where('employee_id', $employeeId);
    }
}
