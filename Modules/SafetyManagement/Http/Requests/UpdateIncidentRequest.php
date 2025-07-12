<?php

namespace Modules\SafetyManagement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateIncidentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'date' => ['required', 'date'],
            'location' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'severity' => ['required', 'in:low,medium,high,critical'],
            'status' => ['required', 'in:open,in_progress,closed'],
            'photos' => ['nullable', 'array'],
        ];
    }
}
