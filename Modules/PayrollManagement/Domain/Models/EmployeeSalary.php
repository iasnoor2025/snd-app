<?php

namespace Modules\PayrollManagement\Domain\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class EmployeeSalary extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'employee_id',
        'effective_from',
        'base_salary',
    ];

    protected $casts = [
        'effective_from' => 'date',
        'base_salary' => 'decimal:2',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function scopeCurrent($query)
    {
        return $query->where('effective_from', '<=', now())
                    ->orderBy('effective_from', 'desc')
                    ->limit(1);
    }
}






