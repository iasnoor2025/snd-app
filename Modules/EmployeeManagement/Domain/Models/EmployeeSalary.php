<?php

namespace Modules\EmployeeManagement\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\Core\Domain\Models\BaseModel;
use Modules\Core\Domain\Models\User;

class EmployeeSalary extends BaseModel
{
    use SoftDeletes;

    protected $fillable = [
        'employee_id',
        'base_salary',
        'food_allowance',
        'housing_allowance',
        'transport_allowance',
        'effective_from',
        'effective_to',
        'reason',
        'approved_by',
        'approved_at',
        'status',
    ];

    protected $casts = [
        'base_salary' => 'decimal:2',
        'food_allowance' => 'decimal:2',
        'housing_allowance' => 'decimal:2',
        'transport_allowance' => 'decimal:2',
        'effective_from' => 'date',
        'effective_to' => 'date',
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

    public function getTotalSalaryAttribute(): float
    {
        return $this->base_salary +
            $this->food_allowance +
            $this->housing_allowance +
            $this->transport_allowance;
    }

    public function getTotalAllowancesAttribute(): float
    {
        return $this->food_allowance +
            $this->housing_allowance +
            $this->transport_allowance;
    }

    public function getAllowancesPercentageAttribute(): float
    {
        if ($this->base_salary === 0) {
            return 0;
        }

        return ($this->total_allowances / $this->base_salary) * 100;
    }

    public function isActive(): bool
    {
        return $this->status === 'approved' &&
            $this->effective_from <= now() &&
            ($this->effective_to === null || $this->effective_to >= now());
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
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






