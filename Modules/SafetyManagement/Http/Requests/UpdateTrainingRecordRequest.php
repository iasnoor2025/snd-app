<?php

namespace Modules\SafetyManagement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTrainingRecordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'course_id' => ['nullable', 'integer'],
            'date' => ['required', 'date'],
            'expiry_date' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
