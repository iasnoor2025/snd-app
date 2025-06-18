<?php

namespace Modules\Payroll\Domain\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\EmployeeManagement\Domain\Models\Employee;
use Modules\Core\Domain\Models\User;

class AdvancePaymentHistory extends Model
{
    use HasFactory;
    use SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int;
use string>
     */
    protected $fillable = [
        'advance_payment_id',
        'employee_id',
        'amount',
        'payment_date',
        'notes',
        'recorded_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'payment_date' => 'date',
        'amount' => 'decimal:2',
    ];

    /**
     * Get the advance payment that this history belongs to.
     */
    public function advancePayment(): BelongsTo
    {
        return $this->belongsTo(AdvancePayment::class);
    }

    /**
     * Get the employee that this history belongs to.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * Get the user who recorded this payment.
     */
    public function recorder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    /**
     * Scope a query to only include payments for a specific employee.
     */
    public function scopeForEmployee($query, $employeeId)
    {
        return $query->where('employee_id', $employeeId);
    }

    /**
     * Scope a query to only include payments for a specific advance payment.
     */
    public function scopeForAdvancePayment($query, $advancePaymentId)
    {
        return $query->where('advance_payment_id', $advancePaymentId);
    }

    /**
     * Scope a query to only include payments within a date range.
     */
    public function scopeBetweenDates($query, $startDate, $endDate)
    {
        return $query->whereBetween('payment_date', [$startDate, $endDate]);
    }
}






