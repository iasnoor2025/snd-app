<?php

namespace Modules\PayrollManagement\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\Core\Traits\HasStatus;
use Modules\Core\Traits\Trackable;

class DeductionRule extends Model
{
    use SoftDeletes, HasStatus, Trackable;

    protected $table = 'payroll_deduction_rules';

    protected $fillable = [
        'name',
        'description',
        'type',
        'calculation_method',
        'amount',
        'percentage',
        'frequency',
        'effective_from',
        'effective_until',
        'requires_approval',
        'auto_apply',
        'employee_category',
        'status',
        'metadata',
        'base_amount_type',
    ];

    protected $casts = [
        'amount' => 'float',
        'percentage' => 'float',
        'requires_approval' => 'boolean',
        'auto_apply' => 'boolean',
        'metadata' => 'array',
        'effective_from' => 'datetime',
        'effective_until' => 'datetime',
    ];

    protected $dates = [
        'effective_from',
        'effective_until',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    /**
     * Get the conditions for this deduction rule
     */
    public function conditions(): HasMany
    {
        return $this->hasMany(DeductionCondition::class);
    }

    /**
     * Get the deductions using this rule
     */
    public function deductions(): HasMany
    {
        return $this->hasMany(PayrollDeduction::class, 'rule_id');
    }

    /**
     * Get the templates using this rule
     */
    public function templates(): HasMany
    {
        return $this->hasMany(DeductionTemplate::class);
    }

    /**
     * Scope a query to only include active rules
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope a query to only include rules for a specific category
     */
    public function scopeForCategory($query, string $category)
    {
        return $query->where(function ($q) use ($category) {
            $q->where('employee_category', $category)
                ->orWhere('employee_category', 'all');
        });
    }

    /**
     * Scope a query to only include currently effective rules
     */
    public function scopeCurrentlyEffective($query)
    {
        $now = now();
        return $query->where('effective_from', '<=', $now)
            ->where(function ($q) use ($now) {
                $q->where('effective_until', '>=', $now)
                    ->orWhereNull('effective_until');
            });
    }

    /**
     * Check if the rule is currently effective
     */
    public function isEffective(): bool
    {
        $now = now();
        return $this->effective_from <= $now && 
            (is_null($this->effective_until) || $this->effective_until >= $now);
    }

    /**
     * Check if the rule requires approval
     */
    public function requiresApproval(): bool
    {
        return $this->requires_approval;
    }

    /**
     * Check if the rule should be auto-applied
     */
    public function shouldAutoApply(): bool
    {
        return $this->auto_apply;
    }

    /**
     * Get the validation rules for creating/updating a deduction rule
     */
    public static function validationRules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|string|in:tax,loan,advance,benefit,other',
            'calculation_method' => 'required|string|in:fixed,percentage,tiered,conditional',
            'amount' => 'required_if:calculation_method,fixed|nullable|numeric|min:0',
            'percentage' => 'required_if:calculation_method,percentage|nullable|numeric|min:0|max:100',
            'frequency' => 'required|string|in:once,monthly,quarterly,yearly',
            'effective_from' => 'required|date',
            'effective_until' => 'nullable|date|after:effective_from',
            'requires_approval' => 'boolean',
            'auto_apply' => 'boolean',
            'employee_category' => 'required|string',
            'status' => 'required|string|in:draft,active,inactive',
            'metadata' => 'nullable|array',
            'base_amount_type' => 'required|string|in:gross,basic,net',
        ];
    }
} 