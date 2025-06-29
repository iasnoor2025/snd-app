<?php

namespace Modules\PayrollManagement\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Loan extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'employee_id',
        'amount',
        'interest_rate',
        'term_months',
        'status',
        'approved_by',
        'approved_at',
        'repaid_amount',
        'start_date',
        'end_date',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'interest_rate' => 'decimal:4',
        'repaid_amount' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
        'approved_at' => 'datetime',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(\Modules\EmployeeManagement\Domain\Models\Employee::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'approved_by');
    }
}
