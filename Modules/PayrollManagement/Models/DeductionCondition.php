<?php

namespace Modules\PayrollManagement\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\Core\Traits\Trackable;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class DeductionCondition extends Model
{
    use SoftDeletes, Trackable, HasFactory;

    protected $table = 'payroll_deduction_conditions';

    protected $fillable = [
        'deduction_rule_id',
        'field',
        'operator',
        'value',
        'amount',
        'percentage',
        'metadata',
    ];

    protected $casts = [
        'value' => 'array',
        'amount' => 'float',
        'percentage' => 'float',
        'metadata' => 'array',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    /**
     * Get the deduction rule this condition belongs to
     */
    public function deductionRule(): BelongsTo
    {
        return $this->belongsTo(DeductionRule::class, 'deduction_rule_id');
    }

    /**
     * Get the validation rules for creating/updating a deduction condition
     */
    public static function validationRules(): array
    {
        return [
            'deduction_rule_id' => 'required|exists:payroll_deduction_rules,id',
            'field' => 'required|string|in:gross_amount,basic_salary,department,designation,employment_type,years_of_service',
            'operator' => 'required|string|in:=,>,<,>=,<=,in,not_in',
            'value' => 'required',
            'amount' => 'required_without:percentage|nullable|numeric|min:0',
            'percentage' => 'required_without:amount|nullable|numeric|min:0|max:100',
            'metadata' => 'nullable|array',
        ];
    }

    /**
     * Get the available fields for conditions
     */
    public static function getAvailableFields(): array
    {
        return [
            'gross_amount' => 'Gross Amount',
            'basic_salary' => 'Basic Salary',
            'department' => 'Department',
            'designation' => 'Designation',
            'employment_type' => 'Employment Type',
            'years_of_service' => 'Years of Service',
        ];
    }

    /**
     * Get the available operators for conditions
     */
    public static function getAvailableOperators(): array
    {
        return [
            '=' => 'Equals',
            '>' => 'Greater Than',
            '<' => 'Less Than',
            '>=' => 'Greater Than or Equal To',
            '<=' => 'Less Than or Equal To',
            'in' => 'In',
            'not_in' => 'Not In',
        ];
    }

    /**
     * Format the condition for display
     */
    public function getDisplayText(): string
    {
        $field = self::getAvailableFields()[$this->field] ?? $this->field;
        $operator = self::getAvailableOperators()[$this->operator] ?? $this->operator;
        $value = is_array($this->value) ? implode(', ', $this->value) : $this->value;

        return "{$field} {$operator} {$value}";
    }

    /**
     * Get the deduction amount or percentage text
     */
    public function getDeductionText(): string
    {
        if (!is_null($this->amount)) {
            return "Deduct {$this->amount}";
        }

        if (!is_null($this->percentage)) {
            return "Deduct {$this->percentage}%";
        }

        return 'No deduction specified';
    }

    protected static function newFactory()
    {
        return \Modules\PayrollManagement\database\factories\DeductionConditionFactory::new();
    }
}
