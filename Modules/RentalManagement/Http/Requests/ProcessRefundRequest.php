<?php

namespace Modules\RentalManagement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProcessRefundRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $payment = $this->route('payment');

        return [
            'amount' => [
                'required',
                'numeric',
                'min:0.01',
                'max:' . $payment->amount
            ],
            'reason' => ['required', 'string', 'max:255'],
            'processed_by' => ['sometimes', 'exists:users,id'],
            'description' => ['sometimes', 'string', 'max:255'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'amount.required' => 'The refund amount is required.',
            'amount.numeric' => 'The refund amount must be a number.',
            'amount.min' => 'The refund amount must be at least 0.01.',
            'amount.max' => 'The refund amount cannot exceed the payment amount.',
            'reason.required' => 'The refund reason is required.',
            'processed_by.exists' => 'The selected user does not exist.',
        ];
    }

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization will be handled by middleware
    }
} 