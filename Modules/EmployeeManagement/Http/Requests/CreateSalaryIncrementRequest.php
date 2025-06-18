<?php

namespace Modules\EmployeeManagement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Modules\EmployeeManagement\Domain\Models\SalaryIncrement;
use Illuminate\Validation\Rule;

class CreateSalaryIncrementRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Add proper authorization logic here
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'employee_id' => ['required', 'exists:employees,id'],
            'increment_type' => [
                'required',
                Rule::in([
                    SalaryIncrement::TYPE_PERCENTAGE,
                    SalaryIncrement::TYPE_AMOUNT,
                    SalaryIncrement::TYPE_PROMOTION,
                    SalaryIncrement::TYPE_ANNUAL_REVIEW,
                    SalaryIncrement::TYPE_PERFORMANCE,
                    SalaryIncrement::TYPE_MARKET_ADJUSTMENT,
                ])
            ],
            'increment_percentage' => [
                'required_if:increment_type,' . SalaryIncrement::TYPE_PERCENTAGE,
                'nullable',
                'numeric',
                'min:0',
                'max:100'
            ],
            'increment_amount' => [
                'required_if:increment_type,' . SalaryIncrement::TYPE_AMOUNT,
                'nullable',
                'numeric',
                'min:0'
            ],
            'new_base_salary' => [
                'required_if:increment_type,' . SalaryIncrement::TYPE_PROMOTION,
                'required_if:increment_type,' . SalaryIncrement::TYPE_ANNUAL_REVIEW,
                'required_if:increment_type,' . SalaryIncrement::TYPE_PERFORMANCE,
                'required_if:increment_type,' . SalaryIncrement::TYPE_MARKET_ADJUSTMENT,
                'nullable',
                'numeric',
                'min:0'
            ],
            'new_food_allowance' => ['nullable', 'numeric', 'min:0'],
            'new_housing_allowance' => ['nullable', 'numeric', 'min:0'],
            'new_transport_allowance' => ['nullable', 'numeric', 'min:0'],
            'apply_to_allowances' => ['nullable', 'boolean'],
            'reason' => ['required', 'string', 'max:500'],
            'effective_date' => ['required', 'date', 'after_or_equal:today'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * Get custom validation messages.
     */
    public function messages(): array
    {
        return [
            'employee_id.required' => 'Please select an employee.',
            'employee_id.exists' => 'The selected employee does not exist.',
            'increment_type.required' => 'Please select an increment type.',
            'increment_type.in' => 'The selected increment type is invalid.',
            'increment_percentage.required_if' => 'Increment percentage is required for percentage-based increments.',
            'increment_percentage.min' => 'Increment percentage must be at least 0%.',
            'increment_percentage.max' => 'Increment percentage cannot exceed 100%.',
            'increment_amount.required_if' => 'Increment amount is required for fixed amount increments.',
            'increment_amount.min' => 'Increment amount must be at least 0.',
            'new_base_salary.required_if' => 'New base salary is required for this increment type.',
            'new_base_salary.min' => 'New base salary must be at least 0.',
            'reason.required' => 'Please provide a reason for the salary increment.',
            'reason.max' => 'Reason cannot exceed 500 characters.',
            'effective_date.required' => 'Please specify the effective date.',
            'effective_date.after_or_equal' => 'Effective date cannot be in the past.',
            'notes.max' => 'Notes cannot exceed 1000 characters.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'employee_id' => 'employee',
            'increment_type' => 'increment type',
            'increment_percentage' => 'increment percentage',
            'increment_amount' => 'increment amount',
            'new_base_salary' => 'new base salary',
            'new_food_allowance' => 'new food allowance',
            'new_housing_allowance' => 'new housing allowance',
            'new_transport_allowance' => 'new transport allowance',
            'effective_date' => 'effective date',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Convert string values to appropriate types
        if ($this->has('increment_percentage')) {
            $this->merge([
                'increment_percentage' => (float) $this->increment_percentage
            ]);
        }

        if ($this->has('increment_amount')) {
            $this->merge([
                'increment_amount' => (float) $this->increment_amount
            ]);
        }

        if ($this->has('new_base_salary')) {
            $this->merge([
                'new_base_salary' => (float) $this->new_base_salary
            ]);
        }

        if ($this->has('new_food_allowance')) {
            $this->merge([
                'new_food_allowance' => (float) $this->new_food_allowance
            ]);
        }

        if ($this->has('new_housing_allowance')) {
            $this->merge([
                'new_housing_allowance' => (float) $this->new_housing_allowance
            ]);
        }

        if ($this->has('new_transport_allowance')) {
            $this->merge([
                'new_transport_allowance' => (float) $this->new_transport_allowance
            ]);
        }
    }
}
