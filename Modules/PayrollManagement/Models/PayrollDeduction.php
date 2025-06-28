<?php

namespace Modules\PayrollManagement\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\Core\Traits\HasStatus;
use Modules\Core\Traits\Trackable;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PayrollDeduction extends Model
{
    use SoftDeletes, HasStatus, Trackable, HasFactory;

    protected $table = 'payroll_deductions';

    protected $fillable = [
        'payroll_id',
        'rule_id',
        'amount',
        'status',
        'approved_by',
        'approved_at',
        'notes',
        'metadata',
    ];

    protected $casts = [
        'amount' => 'float',
        'metadata' => 'array',
        'approved_at' => 'datetime',
    ];

    protected $dates = [
        'approved_at',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    /**
     * Get the payroll entry this deduction belongs to
     */
    public function payroll(): BelongsTo
    {
        return $this->belongsTo(Payroll::class);
    }

    /**
     * Get the rule that generated this deduction
     */
    public function rule(): BelongsTo
    {
        return $this->belongsTo(DeductionRule::class, 'rule_id');
    }

    /**
     * Get the user who approved this deduction
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Scope a query to only include pending deductions
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope a query to only include approved deductions
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope a query to only include rejected deductions
     */
    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    /**
     * Check if the deduction is pending approval
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if the deduction is approved
     */
    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    /**
     * Check if the deduction is rejected
     */
    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    /**
     * Get the validation rules for creating/updating a payroll deduction
     */
    public static function validationRules(): array
    {
        return [
            'payroll_id' => 'required|exists:payrolls,id',
            'rule_id' => 'required|exists:payroll_deduction_rules,id',
            'amount' => 'required|numeric|min:0',
            'status' => 'required|string|in:pending,approved,rejected',
            'approved_by' => 'nullable|exists:users,id',
            'approved_at' => 'nullable|date',
            'notes' => 'nullable|string',
            'metadata' => 'nullable|array',
        ];
    }

    /**
     * Approve the deduction
     */
    public function approve(int $approverId): void
    {
        $this->update([
            'status' => 'approved',
            'approved_by' => $approverId,
            'approved_at' => now(),
        ]);
    }

    /**
     * Reject the deduction
     */
    public function reject(int $approverId, string $notes = null): void
    {
        $this->update([
            'status' => 'rejected',
            'approved_by' => $approverId,
            'approved_at' => now(),
            'notes' => $notes,
        ]);
    }

    protected static function newFactory()
    {
        return \Modules\PayrollManagement\database\factories\PayrollDeductionFactory::new();
    }
} 