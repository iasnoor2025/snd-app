<?php

namespace Modules\PayrollManagement\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class TaxDeduction extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'payroll_id',
        'name',
        'description',
        'amount',
        'type',
        'status',
        'approved_by',
        'approved_at',
        'documentation',
        'metadata',
    ];

    protected $casts = [
        'amount' => 'float',
        'approved_at' => 'datetime',
        'metadata' => 'array',
    ];

    /**
     * Get the payroll entry that owns this deduction
     */
    public function payroll(): BelongsTo
    {
        return $this->belongsTo(Payroll::class);
    }

    /**
     * Get the user who approved this deduction
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Scope a query to only include approved deductions
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope a query to only include deductions of a specific type
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Check if the deduction is approved
     */
    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    /**
     * Approve the deduction
     */
    public function approve(int $userId): bool
    {
        return $this->update([
            'status' => 'approved',
            'approved_by' => $userId,
            'approved_at' => now(),
        ]);
    }

    /**
     * Reject the deduction
     */
    public function reject(int $userId): bool
    {
        return $this->update([
            'status' => 'rejected',
            'approved_by' => $userId,
            'approved_at' => now(),
        ]);
    }
}