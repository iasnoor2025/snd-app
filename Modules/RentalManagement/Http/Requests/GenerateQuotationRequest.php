<?php

namespace Modules\RentalManagement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GenerateQuotationRequest extends FormRequest
{
    public function authorize()
    {
        // TODO: Implement permission logic
        return true;
    }

    public function rules()
    {
        return [
            'rental_id' => 'required|exists:rentals,id',
            'items' => 'required|array|min:1',
            'items.*.equipment_id' => 'required|exists:equipment,id',
            'items.*.price_per_day' => 'required|numeric|min:0',
            'items.*.days' => 'required|integer|min:1',
        ];
    }
}
