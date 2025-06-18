<?php

namespace Modules\LeaveManagement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class LeaveRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array;
     */
    public function rules()
    {
        $rules = [
            'leave_type_id' => ['required', 'exists:leave_types,id'],
            'start_date' => ['required', 'date', 'after_or_equal:today'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'half_day' => ['boolean'],
            'reason' => ['required', 'string', 'min:5', 'max:500'],
            'attachments' => ['nullable', 'array'],
            'attachments.*' => ['file', 'max:10240', 'mimes:pdf,doc,docx,jpg,jpeg,png']
        ];

        // For update requests, we don't require the start_date to be after or equal to today
        if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
            $rules['start_date'] = ['required', 'date'];
        }

        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array;
     */
    public function messages()
    {
        return [
            'leave_type_id.required' => 'Please select a leave type.',
            'leave_type_id.exists' => 'The selected leave type is invalid.',
            'start_date.required' => 'Please select a start date.',
            'start_date.date' => 'The start date must be a valid date.',
            'start_date.after_or_equal' => 'The start date must be today or a future date.',
            'end_date.required' => 'Please select an end date.',
            'end_date.date' => 'The end date must be a valid date.',
            'end_date.after_or_equal' => 'The end date must be on or after the start date.',
            'reason.required' => 'Please provide a reason for your leave request.',
            'reason.min' => 'The reason must be at least :min characters.',
            'reason.max' => 'The reason cannot exceed :max characters.',
            'attachments.*.file' => 'The attachment must be a valid file.',
            'attachments.*.max' => 'The attachment size cannot exceed :max kilobytes.',
            'attachments.*.mimes' => 'The attachment must be a file of type: :values.',
        ];
    }

    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool;
     */
    public function authorize()
    {
        // All authenticated users can create or update their own leave requests
        return Auth::check();
    }

    /**
     * Prepare the data for validation.
     *
     * @return void;
     */
    protected function prepareForValidation()
    {
        // Convert half_day to boolean
        if ($this->has('half_day')) {
            $this->merge([
                'half_day' => filter_var($this->half_day, FILTER_VALIDATE_BOOLEAN)
            ]);
        }
    }
}


