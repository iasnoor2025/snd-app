<?php

namespace Modules\TimesheetManagement\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TimeOffRequest extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'employee_id',
        'start_date',
        'end_date',
        'type',
        'reason',
        'status',
        'approved_by',
        'approved_at',
        'rejected_by',
        'rejected_at',
        'rejection_reason',
    ];

    protected $dates = [
        'start_date',
        'end_date',
        'approved_at',
        'rejected_at',
    ];

    public function employee()
    {
        return $this->belongsTo(\Modules\EmployeeManagement\Domain\Models\Employee::class);
    }

    public function approver()
    {
        return $this->belongsTo(\App\Models\User::class, 'approved_by');
    }

    public function rejector()
    {
        return $this->belongsTo(\App\Models\User::class, 'rejected_by');
    }
}
