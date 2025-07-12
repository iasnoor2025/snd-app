<?php

namespace Modules\SafetyManagement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRiskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'risk_score' => ['required', 'integer'],
            'review_date' => ['nullable', 'date'],
            'status' => ['required', 'in:open,reviewed,closed'],
        ];
    }
}
