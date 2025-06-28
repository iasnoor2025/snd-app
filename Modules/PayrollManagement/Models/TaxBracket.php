<?php

namespace Modules\PayrollManagement\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Modules\Core\Traits\Trackable;

class TaxBracket extends Model
{
    use SoftDeletes, HasFactory, Trackable;

    protected $fillable = [
        'tax_rule_id',
        'income_from',
        'income_to',
        'rate',
        'description',
        'status',
    ];

    protected $casts = [
        'income_from' => 'float',
        'income_to' => 'float',
        'rate' => 'float',
    ];

    /**
     * Get the tax rule that owns this bracket
     */
    public function taxRule(): BelongsTo
    {
        return $this->belongsTo(TaxRule::class);
    }

    /**
     * Scope a query to only include active brackets
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Check if a given income falls within this bracket
     */
    public function containsIncome(float $income): bool
    {
        return $income >= $this->income_from && 
            (!$this->income_to || $income <= $this->income_to);
    }

    /**
     * Calculate tax amount for a given income within this bracket
     */
    public function calculateTax(float $income): float
    {
        if (!$this->containsIncome($income)) {
            return 0;
        }

        $taxableAmount = $this->income_to 
            ? min($income, $this->income_to) - $this->income_from
            : $income - $this->income_from;

        return $taxableAmount * ($this->rate / 100);
    }

    protected static function newFactory()
    {
        return \Modules\PayrollManagement\database\factories\TaxBracketFactory::new();
    }
} 