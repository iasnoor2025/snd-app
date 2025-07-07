<?php

namespace Modules\RentalManagement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ApproveRentalRequest extends FormRequest
{
    public function authorize()
    {
        // TODO: Implement permission logic
        return true;
    }

    public function rules()
    {
        return [
            // Add any additional fields if needed
        ];
    }
}
