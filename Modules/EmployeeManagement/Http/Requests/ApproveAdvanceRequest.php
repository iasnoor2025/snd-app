<?php

namespace Modules\EmployeeManagement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Modules\EmployeeManagement\Domain\Models\EmployeeAdvance;
use Modules\EmployeeManagement\Policies\EmployeeAdvancePolicy;

class ApproveAdvanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        $advance = EmployeeAdvance::findOrFail($this->route('advanceId'));
        return $this->user()->can('approve', $advance);
    }

    public function rules(): array
    {
        return [
            'notes' => 'nullable|string|max:1000'
        ];
    }

    public function messages(): array
    {
        return [
            'notes.max' => 'The notes cannot exceed 1000 characters.'
        ];
    }
}


