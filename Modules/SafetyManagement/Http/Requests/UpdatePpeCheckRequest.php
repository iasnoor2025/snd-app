<?php

namespace Modules\SafetyManagement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePpeCheckRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'equipment_id' => ['required', 'integer'],
            'user_id' => ['required', 'integer'],
            'check_date' => ['required', 'date'],
            'status' => ['required', 'in:ok,needs_repair,replaced'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
