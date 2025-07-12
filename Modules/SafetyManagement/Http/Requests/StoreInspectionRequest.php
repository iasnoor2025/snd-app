<?php

namespace Modules\SafetyManagement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreInspectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'module_id' => ['nullable', 'integer'],
            'scheduled_date' => ['required', 'date'],
            'completed_date' => ['nullable', 'date'],
            'findings' => ['nullable', 'string'],
            'status' => ['required', 'in:scheduled,in_progress,completed,overdue'],
        ];
    }
}
