<?php

namespace Modules\TimesheetManagement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TimesheetApprovalRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool;
     */
    public function authorize()
    {
        return $this->user()->can('timesheets.approve');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array;
     */
    public function rules()
    {
        return [
            'notes' => 'nullable|string|max:1000'
        ];
    }
}

