<?php

namespace Modules\TimesheetManagement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TimesheetRejectionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool;
     */
    public function authorize()
    {
        return $this->user()->can('approve-timesheets');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array;
     */
    public function rules()
    {
        return [
            'rejection_reason' => 'required|string|max:1000'
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array;
     */
    public function messages()
    {
        return [
            'rejection_reason.required' => 'A reason for rejection is required.'
        ];
    }
}

