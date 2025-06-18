<?php

namespace Modules\LeaveManagement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class LeaveTypeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $leaveTypeId = $this->route('leaveType')?->id;

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('leave_types', 'name')->ignore($leaveTypeId),
            ],
            'description' => 'nullable|string|max:1000',
            'max_days_per_year' => 'required|integer|min:1|max:365',
            'requires_approval' => 'boolean',
            'is_paid' => 'boolean',
            'is_active' => 'boolean',
            'carry_forward' => 'boolean',
            'max_carry_forward_days' => 'nullable|integer|min:0|max:365',
            'notice_days_required' => 'nullable|integer|min:0|max:90',
            'gender_specific' => 'nullable|string|in:male,female,both',
            'applicable_after_months' => 'nullable|integer|min:0|max:60',
        ];
    }

    /**
     * Get custom validation messages.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'The leave type name is required.',
            'name.unique' => 'A leave type with this name already exists.',
            'name.max' => 'The leave type name cannot exceed 255 characters.',
            'description.max' => 'The description cannot exceed 1000 characters.',
            'max_days_per_year.required' => 'The maximum days per year is required.',
            'max_days_per_year.integer' => 'The maximum days per year must be a number.',
            'max_days_per_year.min' => 'The maximum days per year must be at least 1.',
            'max_days_per_year.max' => 'The maximum days per year cannot exceed 365.',
            'max_carry_forward_days.integer' => 'The maximum carry forward days must be a number.',
            'max_carry_forward_days.min' => 'The maximum carry forward days cannot be negative.',
            'max_carry_forward_days.max' => 'The maximum carry forward days cannot exceed 365.',
            'notice_days_required.integer' => 'The notice days required must be a number.',
            'notice_days_required.min' => 'The notice days required cannot be negative.',
            'notice_days_required.max' => 'The notice days required cannot exceed 90.',
            'gender_specific.in' => 'The gender specific field must be male, female, or both.',
            'applicable_after_months.integer' => 'The applicable after months must be a number.',
            'applicable_after_months.min' => 'The applicable after months cannot be negative.',
            'applicable_after_months.max' => 'The applicable after months cannot exceed 60.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'name' => 'leave type name',
            'max_days_per_year' => 'maximum days per year',
            'requires_approval' => 'requires approval',
            'is_paid' => 'is paid leave',
            'is_active' => 'is active',
            'carry_forward' => 'carry forward',
            'max_carry_forward_days' => 'maximum carry forward days',
            'notice_days_required' => 'notice days required',
            'gender_specific' => 'gender specific',
            'applicable_after_months' => 'applicable after months',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Convert string booleans to actual booleans
        $this->merge([
            'requires_approval' => $this->boolean('requires_approval'),
            'is_paid' => $this->boolean('is_paid'),
            'is_active' => $this->boolean('is_active', true),
            'carry_forward' => $this->boolean('carry_forward'),
        ]);

        // Set default values
        if (!$this->has('gender_specific')) {
            $this->merge(['gender_specific' => 'both']);
        }
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // If carry_forward is enabled, max_carry_forward_days should be provided
            if ($this->boolean('carry_forward') && !$this->filled('max_carry_forward_days')) {
                $validator->errors()->add(
                    'max_carry_forward_days',
                    'Maximum carry forward days is required when carry forward is enabled.'
                );
            }

            // Max carry forward days should not exceed max days per year
            if ($this->filled('max_carry_forward_days') && $this->filled('max_days_per_year')) {
                if ($this->max_carry_forward_days > $this->max_days_per_year) {
                    $validator->errors()->add(
                        'max_carry_forward_days',
                        'Maximum carry forward days cannot exceed maximum days per year.'
                    );
                }
            }
        });
    }
}
