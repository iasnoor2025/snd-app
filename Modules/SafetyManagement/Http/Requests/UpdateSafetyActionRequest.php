<?php

namespace Modules\SafetyManagement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSafetyActionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'incident_id' => ['required', 'integer'],
            'assigned_to' => ['required', 'integer'],
            'action' => ['required', 'string'],
            'due_date' => ['required', 'date'],
            'completed_at' => ['nullable', 'date'],
            'status' => ['required', 'in:open,in_progress,completed,overdue'],
        ];
    }
}
