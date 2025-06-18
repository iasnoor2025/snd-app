<?php

namespace Modules\EquipmentManagement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EquipmentCostRequest extends FormRequest
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
            'cost_type' => 'required|string',
            'amount' => 'required|numeric|min:0',
            'date' => 'nullable|date',
            'description' => 'nullable|string',
        ];
    }
}
