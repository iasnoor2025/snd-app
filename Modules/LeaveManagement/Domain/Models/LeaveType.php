<?php

namespace Modules\LeaveManagement\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class LeaveType extends Model
{
    use HasFactory;
    use SoftDeletes;
    use LogsActivity;

    protected $fillable = [
        'name',
        'description',
        'days_allowed',
        'requires_approval',
        'requires_attachment',
        'is_paid',
        'is_active',
        'color_code',
        'applies_to_gender',
    ];

    protected $casts = [
        'days_allowed' => 'integer',
        'requires_approval' => 'boolean',
        'requires_attachment' => 'boolean',
        'is_paid' => 'boolean',
        'is_active' => 'boolean',
    ];

    /**
     * Define activity log options
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    /**
     * Relationship with leaves
     */
    public function leaves()
    {
        return $this->hasMany(Leave::class);
    }

    /**
     * Relationship with LeaveBalance
     */
    public function leaveBalances()
    {
        return $this->hasMany(LeaveBalance::class);
    }

    /**
     * Scope for active leave types
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for paid leave types
     */
    public function scopePaid($query)
    {
        return $query->where('is_paid', true);
    }

    /**
     * Scope for unpaid leave types
     */
    public function scopeUnpaid($query)
    {
        return $query->where('is_paid', false);
    }

    /**
     * Scope for leave types applicable to a specific gender
     */
    public function scopeForGender($query, $gender)
    {
        return $query->where(function ($q) use ($gender) {
            $q->where('applies_to_gender', $gender)
              ->orWhereNull('applies_to_gender');
        });
    }
}





