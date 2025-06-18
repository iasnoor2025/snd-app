<?php

namespace Modules\RentalManagement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RentalItemRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('rentals.edit');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>;
     */
    public function rules(): array
    {
        return [
            'equipment_id' => ['required', 'exists:equipment,id'],
            'operator_id' => ['nullable', 'exists:employees,id'],
            'rate' => ['required', 'numeric', 'min:0'],
            'rate_type' => ['required', 'string', 'in:daily,weekly,monthly'],
            'days' => ['required', 'integer', 'min:1'],
            'discount_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'notes' => ['nullable', 'string', 'max:1000']
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>;
     */
    public function messages(): array
    {
        return [
            'equipment_id.required' => 'Please select an equipment.',
            'equipment_id.exists' => 'The selected equipment is invalid.',
            'operator_id.exists' => 'The selected operator is invalid.',
            'rate.required' => 'The rate is required.',
            'rate.numeric' => 'The rate must be a number.',
            'rate.min' => 'The rate must be greater than or equal to 0.',
            'rate_type.required' => 'The rate type is required.',
            'rate_type.in' => 'The rate type must be daily, weekly, or monthly.',
            'days.required' => 'The number of days is required.',
            'days.integer' => 'The number of days must be an integer.',
            'days.min' => 'The number of days must be at least 1.',
            'discount_percentage.numeric' => 'The discount percentage must be a number.',
            'discount_percentage.min' => 'The discount percentage must be greater than or equal to 0.',
            'discount_percentage.max' => 'The discount percentage must be less than or equal to 100.',
            'notes.max' => 'The notes must not exceed 1000 characters.',
        ];
    }
}

