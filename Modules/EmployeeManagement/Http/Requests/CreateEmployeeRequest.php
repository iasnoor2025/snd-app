<?php

namespace Modules\EmployeeManagement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest as BaseFormRequest;

class CreateEmployeeRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:employees,email'],
            'phone' => ['required', 'string', 'max:20'],
            'designation_id' => ['required', 'exists:designations,id'],
            'department_id' => ['required', 'exists:departments,id'],
            'date_of_birth' => ['required', 'date'],
            'iqama_number' => ['required', 'string', 'max:50'],
            'passport_number' => ['required', 'string', 'max:50'],
            'driving_license_number' => ['nullable', 'string', 'max:50'],
            'tuv_certification_number' => ['nullable', 'string', 'max:50'],
            'custom_certifications' => ['nullable', 'array'],
            'emergency_contact_name' => ['required', 'string', 'max:255'],
            'emergency_contact_phone' => ['required', 'string', 'max:20'],
            'emergency_contact_relationship' => ['required', 'string', 'max:50'],
            'bank_name' => ['nullable', 'string', 'max:255'],
            'bank_account_number' => ['nullable', 'string', 'max:50'],
            'bank_iban' => ['nullable', 'string', 'max:50'],
            'hourly_rate' => ['required', 'numeric', 'min:0'],
            'basic_salary' => ['required', 'numeric', 'min:0'],
            'food_allowance' => ['required', 'numeric', 'min:0'],
            'housing_allowance' => ['required', 'numeric', 'min:0'],
            'transport_allowance' => ['required', 'numeric', 'min:0'],
            'is_operator' => ['boolean'],
            'create_user_account' => ['boolean'],
            'user_role' => ['required_if:create_user_account,true', 'string', 'exists:roles,name']
        ];
    }

    public function messages(): array
    {
        return [
            'designation_id.exists' => 'The selected designation is invalid.',
            'department_id.exists' => 'The selected department is invalid.',
            'user_role.exists' => 'The selected role is invalid.',
            'user_role.required_if' => 'The role field is required when creating a user account.',
        ];
    }
}

