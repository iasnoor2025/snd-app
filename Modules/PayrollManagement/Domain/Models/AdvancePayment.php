<?php

namespace Modules\PayrollManagement\Domain\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\EmployeeManagement\Domain\Models\Employee;
use Modules\Core\Domain\Models\User;

class AdvancePayment extends Model
{
    use HasFactory;
    use SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'employee_id',
        'amount',
        'reason',
        'status',
        'payment_date',
        'repaid_amount',
        'monthly_deduction',
        'repayment_date',
        'estimated_months',
        'rejection_reason',
        'approved_by',
        'approved_at',
        'rejected_by',
        'rejected_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'amount' => 'decimal:2',
        'repaid_amount' => 'decimal:2',
        'monthly_deduction' => 'decimal:2',
        'payment_date' => 'date',
        'repayment_date' => 'date',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
    ];

    /**
     * Get the employee associated with the advance payment
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * Get the user who approved the advance payment
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get the user who approved the advance payment (alias for approver)
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get the user who rejected the advance payment
     */
    public function rejecter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rejected_by');
    }

    /**
     * Get the payment history records for this advance payment
     */
    public function paymentHistories(): HasMany
    {
        return $this->hasMany(AdvancePaymentHistory::class);
    }

    /**
     * Calculate the remaining balance to be repaid
     */
    public function getRemainingBalanceAttribute(): float
    {
        return $this->amount - $this->repaid_amount;
    }

    /**
     * Check if the advance payment is fully repaid
     */
    public function isFullyRepaid(): bool
    {
        return $this->repaid_amount >= $this->amount;
    }

    /**
     * Check if the advance payment is partially repaid
     */
    public function isPartiallyRepaid(): bool
    {
        return $this->repaid_amount > 0 && $this->repaid_amount < $this->amount;
    }

    /**
     * Add a repayment to the advance payment
     */
    public function addRepayment(float $amount): void
    {
        try {
            $this->repaid_amount = $this->repaid_amount + $amount;

            // Update status based on repayment amount
            if ($this->repaid_amount >= $this->amount) {
                $this->status = 'paid';
            } elseif ($this->repaid_amount > 0) {
                $this->status = 'partially_repaid';
            }

            $this->save();
        } catch (\Exception $e) {
            \Log::error('Error adding repayment to advance: ' . $e->getMessage(), [
                'advance_id' => $this->id,
                'amount' => $amount,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Approve the advance payment
     */
    public function approve(int $userId): void
    {
        $this->status = 'approved';
        $this->approved_by = $userId;
        $this->approved_at = now();
        $this->save();
    }

    /**
     * Reject the advance payment
     */
    public function reject(int $userId, string $reason): void
    {
        $this->status = 'rejected';
        $this->rejected_by = $userId;
        $this->rejected_at = now();
        $this->rejection_reason = $reason;
        $this->save();
    }
}






