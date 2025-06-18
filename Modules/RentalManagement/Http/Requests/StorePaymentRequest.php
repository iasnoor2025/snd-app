<?php

namespace Modules\RentalManagement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePaymentRequest extends FormRequest
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
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>;
     */
    public function rules(): array
    {
        return [
            'amount' => 'required|numeric|min:0',
            'payment_date' => 'required|date',
            'payment_method' => 'required|in:cash,credit_card,bank_transfer',
            'status' => 'required|in:pending,completed,failed',
            'transaction_id' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:1000',
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
            'amount.required' => 'Please enter the payment amount.',
            'amount.numeric' => 'The payment amount must be a number.',
            'amount.min' => 'The payment amount must be greater than or equal to 0.',
            'payment_date.required' => 'Please select a payment date.',
            'payment_date.date' => 'The payment date must be a valid date.',
            'payment_method.required' => 'Please select a payment method.',
            'payment_method.in' => 'The selected payment method is invalid.',
            'status.required' => 'Please select a payment status.',
            'status.in' => 'The selected payment status is invalid.',
            'transaction_id.max' => 'The transaction ID cannot exceed 100 characters.',
            'notes.max' => 'The notes cannot exceed 1000 characters.',
        ];
    }
}

