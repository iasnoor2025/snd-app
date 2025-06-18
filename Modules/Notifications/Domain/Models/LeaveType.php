<?php

namespace Modules\Notifications\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Modules\Notifications\Database\Factories\LeaveTypeFactory;

class LeaveType extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'description',
        'days_per_year',
        'color',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function leaves()
    {
        return $this->hasMany(Leave::class);
    }

    public function leaveRequests()
    {
        return $this->hasMany(LeaveRequest::class);
    }

    /**
     * Create a new factory instance for the model.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory;
     */
    protected static function newFactory()
    {
        return LeaveTypeFactory::new();
    }
}





