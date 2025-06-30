<?php

namespace Modules\EmployeeManagement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BulkApproveTimesheetsRequest extends FormRequest
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
            'timesheet_ids' => 'required|array',
            'timesheet_ids.*' => 'required|integer|exists:employee_timesheets,id,status,pending'
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'timesheet_ids.required' => 'Please select at least one timesheet to approve',
            'timesheet_ids.array' => 'Invalid timesheet selection format',
            'timesheet_ids.*.exists' => 'One or more selected timesheets are invalid or already processed'
        ];
    }
}
