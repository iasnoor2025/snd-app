<?php

namespace Modules\PayrollManagement\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class TaxRule extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'calculation_method',
        'rate',
        'employee_category',
        'effective_from',
        'effective_until',
        'status',
        'metadata',
    ];

    protected $casts = [
        'rate' => 'float',
        'effective_from' => 'datetime',
        'effective_until' => 'datetime',
        'metadata' => 'array',
    ];

    /**
     * Get the tax brackets for this rule
     */
    public function brackets(): HasMany
    {
        return $this->hasMany(TaxBracket::class);
    }

    /**
     * Scope a query to only include active rules
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope a query to only include rules effective at a given date
     */
    public function scopeEffectiveAt($query, $date)
    {
        return $query->where('effective_from', '<=', $date)
            ->where(function ($query) use ($date) {
                $query->where('effective_until', '>=', $date)
                    ->orWhereNull('effective_until');
            });
    }
}