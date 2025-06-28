<?php

namespace Modules\PayrollManagement\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\Core\Traits\HasStatus;
use Modules\Core\Traits\Trackable;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class DeductionTemplate extends Model
{
    use SoftDeletes, HasStatus, Trackable, HasFactory;

    protected $table = 'payroll_deduction_templates';

    protected $fillable = [
        'name',
        'description',
        'rules',
        'metadata',
        'status',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'rules' => 'array',
        'metadata' => 'array',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    /**
     * Get the rules associated with this template
     */
    public function deductionRules(): BelongsToMany
    {
        return $this->belongsToMany(DeductionRule::class, 'payroll_template_rules')
            ->withPivot('order')
            ->orderBy('order');
    }

    /**
     * Get the validation rules for creating/updating a deduction template
     */
    public static function validationRules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'rules' => 'required|array',
            'rules.*.rule_id' => 'required|exists:payroll_deduction_rules,id',
            'rules.*.order' => 'required|integer|min:0',
            'metadata' => 'nullable|array',
            'status' => 'required|string|in:draft,active,inactive',
        ];
    }

    /**
     * Scope a query to only include active templates
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Check if the template is active
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Get the rules in order
     */
    public function getOrderedRules(): array
    {
        return $this->deductionRules()
            ->get()
            ->map(function ($rule) {
                return array_merge($rule->toArray(), [
                    'order' => $rule->pivot->order,
                ]);
            })
            ->sortBy('order')
            ->values()
            ->toArray();
    }

    /**
     * Add a rule to the template
     */
    public function addRule(DeductionRule $rule, int $order = null): void
    {
        if (is_null($order)) {
            $order = $this->deductionRules()->count();
        }

        $this->deductionRules()->attach($rule->id, ['order' => $order]);
    }

    /**
     * Remove a rule from the template
     */
    public function removeRule(DeductionRule $rule): void
    {
        $this->deductionRules()->detach($rule->id);
    }

    /**
     * Reorder rules in the template
     */
    public function reorderRules(array $ruleIds): void
    {
        foreach ($ruleIds as $order => $ruleId) {
            $this->deductionRules()
                ->updateExistingPivot($ruleId, ['order' => $order]);
        }
    }

    protected static function newFactory()
    {
        return \Modules\PayrollManagement\database\factories\DeductionTemplateFactory::new();
    }
} 