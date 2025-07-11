<?php

namespace Modules\EmployeeManagement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ApproveTimesheetRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Check if the user has the 'timesheets.approve' permission
        return $this->user() && $this->user()->can('timesheets.approve');
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'notes' => 'nullable|string|max:1000'
        ];
    }
}

