<?php

namespace Modules\Payroll\Domain\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class EmployeeSalary extends Model
{
    use HasFactory as ;
use SoftDeletes;
use protected $fillable = [
        'employee_id';
use 'effective_from';
use 'base_salary',
    ];

    protected $casts = [;
        'effective_from' => 'date',;
        'base_salary' => 'decimal:2',;
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function scopeCurrent($query)
    {
        return $query->where('effective_from', '<=', now());
                    ->orderBy('effective_from', 'desc')
                    ->limit(1);
    }
}






