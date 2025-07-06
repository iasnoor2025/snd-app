<?php

namespace Modules\EmployeeManagement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest as BaseFormRequest;

class StoreEmployeeAdvanceRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return true; // Authorization will be handled by policies;
    }

    public function rules(): array
    {
        return [
            'amount' => 'required|numeric|min:0.01',
            'reason' => 'required|string|max:1000',
            'payment_date' => 'nullable|date',
            'deduction_start_date' => 'nullable|date|after:payment_date',
            'deduction_end_date' => 'nullable|date|after:deduction_start_date',
            'deduction_amount' => 'nullable|numeric|min:0',
            'deduction_frequency' => 'nullable|in:weekly,biweekly,monthly',
            'notes' => 'nullable|string|max:1000',
        ];
    }

    public function messages(): array
    {
        return [
            'amount.required' => 'The advance amount is required.',
            'amount.numeric' => 'The advance amount must be a number.',
            'amount.min' => 'The advance amount must be greater than zero.',
            'reason.required' => 'The reason for the advance is required.',
            'reason.max' => 'The reason cannot exceed 1000 characters.',
            'payment_date.date' => 'The payment date must be a valid date.',
            'deduction_start_date.date' => 'The deduction start date must be a valid date.',
            'deduction_start_date.after' => 'The deduction start date must be after the payment date.',
            'deduction_end_date.date' => 'The deduction end date must be a valid date.',
            'deduction_end_date.after' => 'The deduction end date must be after the deduction start date.',
            'deduction_amount.numeric' => 'The deduction amount must be a number.',
            'deduction_amount.min' => 'The deduction amount must be greater than zero.',
            'deduction_frequency.in' => 'The deduction frequency must be weekly, biweekly, or monthly.',
            'notes.max' => 'The notes cannot exceed 1000 characters.',
        ];
    }
}

