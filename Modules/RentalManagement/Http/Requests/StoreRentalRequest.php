<?php

namespace Modules\RentalManagement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRentalRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('rentals.create');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>;
     */
    public function rules(): array
    {
        return [
            'customer_id' => ['required', 'exists:customers,id'],
            'rental_number' => ['required', 'string', 'unique:rentals,rental_number'],
            'start_date' => ['required', 'date', 'after_or_equal:today'],
            'expected_end_date' => ['required', 'date', 'after:start_date'],
            'rental_items' => ['required', 'array', 'min:1'],
            'rental_items.*.equipment_id' => ['required', 'exists:equipment,id'],
            'rental_items.*.rate' => ['required', 'numeric', 'min:0'],
            'rental_items.*.rate_type' => ['required', 'in:hourly,daily,weekly,monthly'],
            'rental_items.*.operator_id' => ['nullable', 'exists:employees,id'],
            'rental_items.*.notes' => ['nullable', 'string', 'max:1000'],
            'rental_items.*.days' => ['required', 'integer', 'min:1'],
            'rental_items.*.discount_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'rental_items.*.total_amount' => ['required', 'numeric', 'min:0'],
            'deposit_amount' => ['nullable', 'numeric', 'min:0'],
            'tax_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'discount_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'payment_terms_days' => ['nullable', 'integer', 'min:0'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'has_timesheet' => ['boolean'],
            'has_operators' => ['boolean']
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
            'customer_id.required' => 'Please select a customer.',
            'customer_id.exists' => 'The selected customer is invalid.',
            'rental_number.required' => 'The rental number is required.',
            'rental_number.unique' => 'This rental number is already in use.',
            'start_date.required' => 'Please select a start date.',
            'start_date.date' => 'The start date must be a valid date.',
            'start_date.after_or_equal' => 'The start date must be today or a future date.',
            'expected_end_date.required' => 'Please select an end date.',
            'expected_end_date.date' => 'The end date must be a valid date.',
            'expected_end_date.after' => 'The end date must be after the start date.',
            'rental_items.required' => 'At least one rental item is required.',
            'rental_items.array' => 'The rental items must be an array.',
            'rental_items.min' => 'At least one rental item is required.',
            'rental_items.*.equipment_id.required' => 'Please select equipment for each rental item.',
            'rental_items.*.equipment_id.exists' => 'The selected equipment is invalid.',
            'rental_items.*.rate.required' => 'Please enter a rate for each rental item.',
            'rental_items.*.rate.numeric' => 'The rate must be a number.',
            'rental_items.*.rate.min' => 'The rate must be greater than or equal to 0.',
            'rental_items.*.rate_type.required' => 'Please select a rate type for each rental item.',
            'rental_items.*.rate_type.in' => 'The selected rate type is invalid.',
            'rental_items.*.operator_id.exists' => 'The selected operator is invalid.',
            'rental_items.*.notes.max' => 'The notes cannot exceed 1000 characters.',
            'rental_items.*.days.required' => 'Please enter the number of days for each rental item.',
            'rental_items.*.days.integer' => 'The days must be a whole number.',
            'rental_items.*.days.min' => 'The days must be at least 1.',
            'rental_items.*.discount_percentage.numeric' => 'The discount percentage must be a number.',
            'rental_items.*.discount_percentage.min' => 'The discount percentage must be greater than or equal to 0.',
            'rental_items.*.discount_percentage.max' => 'The discount percentage cannot exceed 100.',
            'rental_items.*.total_amount.required' => 'Please enter the total amount for each rental item.',
            'rental_items.*.total_amount.numeric' => 'The total amount must be a number.',
            'rental_items.*.total_amount.min' => 'The total amount must be greater than or equal to 0.',
            'deposit_amount.numeric' => 'The deposit amount must be a number.',
            'deposit_amount.min' => 'The deposit amount must be greater than or equal to 0.',
            'tax_percentage.numeric' => 'The tax percentage must be a number.',
            'tax_percentage.min' => 'The tax percentage must be greater than or equal to 0.',
            'tax_percentage.max' => 'The tax percentage cannot exceed 100.',
            'discount_percentage.numeric' => 'The discount percentage must be a number.',
            'discount_percentage.min' => 'The discount percentage must be greater than or equal to 0.',
            'discount_percentage.max' => 'The discount percentage cannot exceed 100.',
            'payment_terms_days.integer' => 'The payment terms days must be a whole number.',
            'payment_terms_days.min' => 'The payment terms days must be greater than or equal to 0.',
            'notes.max' => 'The notes cannot exceed 1000 characters.',
            'has_timesheet.boolean' => 'The timesheet flag must be true or false.',
            'has_operators.boolean' => 'The operators flag must be true or false.',
        ];
    }
}

