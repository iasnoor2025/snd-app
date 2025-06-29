<?php

namespace Modules\PayrollManagement\Domain\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FinalSettlementItem extends Model
{
    use HasFactory, SoftDeletes;
    protected $fillable = [
        'final_settlement_id',
        'type',
        'description',
        'amount',
        'metadata',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'metadata' => 'array',
    ];

    public function finalSettlement(): BelongsTo
    {
        return $this->belongsTo(FinalSettlement::class);
    }

    public function scopeSalary($query)
    {
        return $query->where('type', 'salary');
    }

    public function scopeOvertime($query)
    {
        return $query->where('type', 'overtime');
    }

    public function scopeLeave($query)
    {
        return $query->where('type', 'leave');
    }

    public function scopeAllowance($query)
    {
        return $query->where('type', 'allowance');
    }

    public function scopeDeduction($query)
    {
        return $query->where('type', 'deduction');
    }

    public static function types()
    {
        return [
            'salary' => 'Unpaid Salary',
            'overtime' => 'Overtime',
            'leave' => 'Leave Encashment',
            'allowance' => 'Allowance',
            'deduction' => 'Deduction',
        ];
    }
}






