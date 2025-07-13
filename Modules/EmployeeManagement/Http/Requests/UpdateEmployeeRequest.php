<?php

namespace Modules\EmployeeManagement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Modules\EmployeeManagement\Domain\Models\Employee;

class UpdateEmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $employee = $this->route('employee');

        return [
            'user_id' => 'nullable|exists:users,id',
            'employee_id' => 'nullable|string|max:50|unique:employees,employee_id,' . $employee->id,
            'file_number' => 'nullable|string|max:50|unique:employees,file_number,' . $employee->id,
            'first_name' => 'nullable|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'email' => [
                'nullable',
                'email',
                Rule::unique('employees', 'email')->ignore($this->route('employee')->id),
            ],
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'nationality' => 'nullable|string|max:100',
            'designation_id' => 'nullable|exists:designations,id',
            'department_id' => 'nullable|exists:departments,id',
            'supervisor' => 'nullable|string|max:255',
            'hourly_rate' => 'nullable|numeric|min:0',
            'basic_salary' => 'nullable|numeric|min:0',
            'food_allowance' => 'nullable|numeric|min:0',
            'housing_allowance' => 'nullable|numeric|min:0',
            'transport_allowance' => 'nullable|numeric|min:0',
            'absent_deduction_rate' => 'nullable|numeric|min:0',
            'overtime_rate_multiplier' => 'nullable|numeric|min:0',
            'overtime_fixed_rate' => 'nullable|numeric|min:0',
            'bank_name' => 'nullable|string|max:255',
            'bank_account_number' => 'nullable|string|max:50',
            'bank_iban' => 'nullable|string|max:50',
            'contract_hours_per_day' => 'nullable|integer|min:1|max:24',
            'contract_days_per_month' => 'nullable|integer|min:1|max:31',
            'hire_date' => 'nullable|date',
            'status' => 'nullable|string|in:active,inactive,on_leave,terminated',
            'current_location' => 'nullable|string|max:255',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'emergency_contact_relationship' => 'nullable|string|max:50',
            'notes' => 'nullable|string',
            'advance_salary_eligible' => 'nullable|boolean',
            'advance_salary_approved_this_month' => 'nullable|boolean',
            'date_of_birth' => 'nullable|date',
            'iqama_number' => 'nullable|string|max:50',
            'iqama_expiry' => 'nullable|date',
            'iqama_cost' => 'nullable|numeric|min:0',
            'passport_number' => 'nullable|string|max:50',
            'passport_expiry' => 'nullable|date',
            'driving_license_number' => 'nullable|string|max:50',
            'driving_license_expiry' => 'nullable|date',
            'driving_license_cost' => 'nullable|numeric|min:0',
            'operator_license_number' => 'nullable|string|max:50',
            'operator_license_expiry' => 'nullable|date',
            'operator_license_cost' => 'nullable|numeric|min:0',
            'tuv_certification_number' => 'nullable|string|max:50',
            'tuv_certification_expiry' => 'nullable|date',
            'tuv_certification_cost' => 'nullable|numeric|min:0',
            'spsp_license_number' => 'nullable|string|max:50',
            'spsp_license_expiry' => 'nullable|date',
            'spsp_license_cost' => 'nullable|numeric|min:0',
            'custom_certifications' => 'nullable|array',
            'is_operator' => 'boolean'
        ];
    }

    public function messages(): array
    {
        return [
            'user_id.exists' => 'The selected user does not exist.',
            'employee_id.unique' => 'This employee ID is already in use.',
            'file_number.unique' => 'This file number is already in use.',
            'email.unique' => 'This email address is already in use.',
            'designation_id.exists' => 'The selected designation does not exist.',
            'department_id.exists' => 'The selected department does not exist.',
            'hire_date.required' => 'The hire date is required.',
            'hire_date.date' => 'The hire date must be a valid date.',
            'status.in' => 'The status must be one of: active, inactive, on_leave, terminated.',
            'contract_hours_per_day.min' => 'Contract hours per day must be at least 1.',
            'contract_hours_per_day.max' => 'Contract hours per day cannot exceed 24.',
            'contract_days_per_month.min' => 'Contract days per month must be at least 1.',
            'contract_days_per_month.max' => 'Contract days per month cannot exceed 31.',

        ];
    }
}

