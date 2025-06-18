<?php

namespace Modules\EquipmentManagement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EquipmentUtilizationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'start_time' => 'nullable|date',
            'end_time' => 'nullable|date|after_or_equal:start_time',
            'notes' => 'nullable|string',
            'status' => 'nullable|string',
        ];
    }
}
