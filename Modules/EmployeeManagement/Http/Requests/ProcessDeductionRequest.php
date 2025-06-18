<?php

namespace Modules\EmployeeManagement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Modules\EmployeeManagement\Domain\Models\EmployeeAdvance;
use Modules\EmployeeManagement\Policies\EmployeeAdvancePolicy;

class ProcessDeductionRequest extends FormRequest
{
    public function authorize(): bool
    {
        $advance = EmployeeAdvance::findOrFail($this->route('advanceId'));
        return $this->user()->can('processDeduction', $advance);
    }

    public function rules(): array
    {
        return [
            'amount' => 'required|numeric|min:0',
            'notes' => 'nullable|string|max:1000',
        ];
    }

    public function messages(): array
    {
        return [
            'amount.required' => 'The deduction amount is required.',
            'amount.numeric' => 'The deduction amount must be a number.',
            'amount.min' => 'The deduction amount must be greater than zero.',
            'notes.max' => 'The notes cannot exceed 1000 characters.',
        ];
    }
}

