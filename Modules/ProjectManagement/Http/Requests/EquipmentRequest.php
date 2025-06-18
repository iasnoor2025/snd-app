<?php

namespace Modules\ProjectManagement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EquipmentRequest extends FormRequest
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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'equipment_id' => 'required|exists:equipment,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'usage_hours' => 'required|numeric|min:0',
            'hourly_rate' => 'required|numeric|min:0',
            'maintenance_cost' => 'nullable|numeric|min:0',
            'total_cost' => 'required|numeric|min:0',
            'notes' => 'nullable|string|max:1000',
        ];
    }
}
