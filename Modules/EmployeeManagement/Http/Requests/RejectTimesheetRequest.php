<?php

namespace Modules\EmployeeManagement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RejectTimesheetRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Check if the user has the 'timesheets.approve' permission (same as for approving)
        return $this->user() && $this->user()->can('timesheets.approve');
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'reason' => 'required|string|max:1000'
        ];
    }
}

