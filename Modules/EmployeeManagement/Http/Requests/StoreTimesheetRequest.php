<?php

namespace Modules\EmployeeManagement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTimesheetRequest extends FormRequest
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
     */
    public function rules(): array
    {
        return [
            'date' => 'required|date',
            'clock_in' => 'required|date_format:Y-m-d H:i:s',
            'clock_out' => 'required|date_format:Y-m-d H:i:s|after:clock_in',
            'break_start' => 'nullable|date_format:Y-m-d H:i:s|after:clock_in|before:clock_out',
            'break_end' => 'nullable|date_format:Y-m-d H:i:s|after:break_start|before:clock_out',
            'total_hours' => 'nullable|numeric|min:0',
            'regular_hours' => 'nullable|numeric|min:0',
            'overtime_hours' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:1000',
            'project_id' => 'nullable|exists:projects,id',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'clock_out.after' => 'Clock out time must be after clock in time',
            'break_start.after' => 'Break start time must be after clock in time',
            'break_start.before' => 'Break start time must be before clock out time',
            'break_end.after' => 'Break end time must be after break start time',
            'break_end.before' => 'Break end time must be before clock out time',
        ];
    }
}
