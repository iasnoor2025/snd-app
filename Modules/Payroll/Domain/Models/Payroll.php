<?php

namespace Modules\Payroll\Domain\Models;

use Modules\Employee\Domain\Models\Employee;
use Modules\Core\Domain\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Modules\Payroll\app\Events\PayrollCreated;
use Modules\Payroll\app\Events\PayrollUpdated;
use Modules\Payroll\app\Events\PayrollProcessed;

class Payroll extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'employee_id',
        'payroll_month',
        'base_salary',
        'overtime_amount',
        'bonus_amount',
        'deduction_amount',
        'advance_deduction',
        'final_amount',
        'total_worked_hours',
        'overtime_hours',
        'status',
        'notes',
        'approved_by',
        'approved_at',
        'paid_by',
        'paid_at',
        'payment_method',
        'payment_reference',
        'payment_status',
        'payment_processed_at'
    ];

    protected $casts = [
        'payroll_month' => 'date',
        'approved_at' => 'datetime',
        'paid_at' => 'datetime',
        'payment_processed_at' => 'datetime',
        'base_salary' => 'decimal:2',
        'overtime_amount' => 'decimal:2',
        'bonus_amount' => 'decimal:2',
        'deduction_amount' => 'decimal:2',
        'advance_deduction' => 'decimal:2',
        'final_amount' => 'decimal:2'
    ];

    protected $dispatchesEvents = [
        'created' => PayrollCreated::class,
        'updated' => PayrollUpdated::class
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(PayrollItem::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function payer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'paid_by');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    public function approve(User $user)
    {
        $this->update([
            'status' => 'approved',
            'approved_by' => $user->id,
            'approved_at' => now(),
        ]);
    }

    public function markAsPaid(User $user)
    {
        $this->update([
            'status' => 'paid',
            'paid_by' => $user->id,
            'paid_at' => now(),
        ]);
    }

    public function cancel()
    {
        $this->update(['status' => 'cancelled']);
    }

    public function calculateFinalAmount()
    {
        $this->final_amount = $this->base_salary +
            $this->overtime_amount +
            $this->bonus_amount -
            $this->deduction_amount -
            $this->advance_deduction;

        $this->save();

        return $this;
    }

    public function process(): void
    {
        $this->status = 'processed';
        $this->processed_at = now();
        $this->save();

        event(new PayrollProcessed($this));
    }

    public function isProcessed(): bool
    {
        return $this->status === 'processed';
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isPaid(): bool
    {
        return $this->status === 'paid';
    }
}






