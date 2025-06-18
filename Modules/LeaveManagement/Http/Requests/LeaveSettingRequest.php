<?php

namespace Modules\LeaveManagement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LeaveSettingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('leave-settings.edit');
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            // General Settings
            'leave_year_start_month' => 'sometimes|integer|between:1,12',
            'leave_year_start_day' => 'sometimes|integer|between:1,31',
            'weekend_days' => 'sometimes|array',
            'weekend_days.*' => 'string|in:sunday,monday,tuesday,wednesday,thursday,friday,saturday',
            'public_holidays_affect_leave' => 'sometimes|boolean',
            'allow_half_day_leave' => 'sometimes|boolean',
            'allow_negative_balance' => 'sometimes|boolean',
            'max_negative_balance_days' => 'sometimes|integer|min:0|max:30',

            // Approval Settings
            'auto_approve_sick_leave' => 'sometimes|boolean',
            'require_medical_certificate_days' => 'sometimes|integer|min:1|max:30',
            'max_consecutive_days_without_approval' => 'sometimes|integer|min:1|max:30',
            'approval_hierarchy_levels' => 'sometimes|integer|min:1|max:5',
            'escalation_days' => 'sometimes|integer|min:1|max:30',

            // Carry Forward Settings
            'global_carry_forward_enabled' => 'sometimes|boolean',
            'carry_forward_deadline_month' => 'sometimes|integer|between:1,12',
            'carry_forward_deadline_day' => 'sometimes|integer|between:1,31',
            'max_carry_forward_percentage' => 'sometimes|integer|min:0|max:100',
            'carry_forward_expiry_months' => 'sometimes|integer|min:1|max:24',

            // Notification Settings
            'notify_employee_on_approval' => 'sometimes|boolean',
            'notify_employee_on_rejection' => 'sometimes|boolean',
            'notify_manager_on_request' => 'sometimes|boolean',
            'notify_hr_on_long_leave' => 'sometimes|boolean',
            'long_leave_threshold_days' => 'sometimes|integer|min:1|max:365',
            'reminder_days_before_expiry' => 'sometimes|array',
            'reminder_days_before_expiry.*' => 'integer|min:1|max:365',

            // Probation Settings
            'probation_leave_allowed' => 'sometimes|boolean',
            'probation_period_months' => 'sometimes|integer|min:1|max:24',
            'probation_leave_types' => 'sometimes|array',
            'probation_leave_types.*' => 'string|max:50',

            // Advanced Settings
            'leave_encashment_enabled' => 'sometimes|boolean',
            'encashment_percentage' => 'sometimes|integer|min:0|max:100',
            'min_encashment_days' => 'sometimes|integer|min:1|max:365',
            'max_encashment_days' => 'sometimes|integer|min:1|max:365',
            'leave_calendar_integration' => 'sometimes|boolean',
            'employee_self_cancel_hours' => 'sometimes|integer|min:0|max:168', // Max 1 week
            'manager_override_balance' => 'sometimes|boolean',
        ];
    }

    /**
     * Get custom validation messages.
     */
    public function messages(): array
    {
        return [
            'leave_year_start_month.between' => 'Leave year start month must be between 1 and 12.',
            'leave_year_start_day.between' => 'Leave year start day must be between 1 and 31.',
            'weekend_days.*.in' => 'Invalid weekend day selected.',
            'max_negative_balance_days.max' => 'Maximum negative balance cannot exceed 30 days.',
            'require_medical_certificate_days.max' => 'Medical certificate requirement cannot exceed 30 days.',
            'max_consecutive_days_without_approval.max' => 'Maximum consecutive days without approval cannot exceed 30.',
            'approval_hierarchy_levels.max' => 'Approval hierarchy cannot exceed 5 levels.',
            'escalation_days.max' => 'Escalation period cannot exceed 30 days.',
            'carry_forward_deadline_month.between' => 'Carry forward deadline month must be between 1 and 12.',
            'carry_forward_deadline_day.between' => 'Carry forward deadline day must be between 1 and 31.',
            'max_carry_forward_percentage.max' => 'Maximum carry forward percentage cannot exceed 100%.',
            'carry_forward_expiry_months.max' => 'Carry forward expiry cannot exceed 24 months.',
            'long_leave_threshold_days.max' => 'Long leave threshold cannot exceed 365 days.',
            'reminder_days_before_expiry.*.max' => 'Reminder days cannot exceed 365 days.',
            'probation_period_months.max' => 'Probation period cannot exceed 24 months.',
            'encashment_percentage.max' => 'Encashment percentage cannot exceed 100%.',
            'min_encashment_days.max' => 'Minimum encashment days cannot exceed 365 days.',
            'max_encashment_days.max' => 'Maximum encashment days cannot exceed 365 days.',
            'employee_self_cancel_hours.max' => 'Employee self-cancel period cannot exceed 168 hours (1 week).',
        ];
    }

    /**
     * Get custom attribute names.
     */
    public function attributes(): array
    {
        return [
            'leave_year_start_month' => 'leave year start month',
            'leave_year_start_day' => 'leave year start day',
            'weekend_days' => 'weekend days',
            'public_holidays_affect_leave' => 'public holidays affect leave',
            'allow_half_day_leave' => 'allow half day leave',
            'allow_negative_balance' => 'allow negative balance',
            'max_negative_balance_days' => 'maximum negative balance days',
            'auto_approve_sick_leave' => 'auto approve sick leave',
            'require_medical_certificate_days' => 'require medical certificate days',
            'max_consecutive_days_without_approval' => 'maximum consecutive days without approval',
            'approval_hierarchy_levels' => 'approval hierarchy levels',
            'escalation_days' => 'escalation days',
            'global_carry_forward_enabled' => 'global carry forward enabled',
            'carry_forward_deadline_month' => 'carry forward deadline month',
            'carry_forward_deadline_day' => 'carry forward deadline day',
            'max_carry_forward_percentage' => 'maximum carry forward percentage',
            'carry_forward_expiry_months' => 'carry forward expiry months',
            'notify_employee_on_approval' => 'notify employee on approval',
            'notify_employee_on_rejection' => 'notify employee on rejection',
            'notify_manager_on_request' => 'notify manager on request',
            'notify_hr_on_long_leave' => 'notify HR on long leave',
            'long_leave_threshold_days' => 'long leave threshold days',
            'reminder_days_before_expiry' => 'reminder days before expiry',
            'probation_leave_allowed' => 'probation leave allowed',
            'probation_period_months' => 'probation period months',
            'probation_leave_types' => 'probation leave types',
            'leave_encashment_enabled' => 'leave encashment enabled',
            'encashment_percentage' => 'encashment percentage',
            'min_encashment_days' => 'minimum encashment days',
            'max_encashment_days' => 'maximum encashment days',
            'leave_calendar_integration' => 'leave calendar integration',
            'employee_self_cancel_hours' => 'employee self cancel hours',
            'manager_override_balance' => 'manager override balance',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Validate that min encashment days is not greater than max
            if ($this->has('min_encashment_days') && $this->has('max_encashment_days')) {
                if ($this->min_encashment_days > $this->max_encashment_days) {
                    $validator->errors()->add('min_encashment_days', 'Minimum encashment days cannot be greater than maximum encashment days.');
                }
            }

            // Validate carry forward deadline
            if ($this->has('carry_forward_deadline_month') && $this->has('carry_forward_deadline_day')) {
                $month = $this->carry_forward_deadline_month;
                $day = $this->carry_forward_deadline_day;

                // Check if the day is valid for the given month
                if (!checkdate($month, $day, date('Y'))) {
                    $validator->errors()->add('carry_forward_deadline_day', 'Invalid day for the selected month.');
                }
            }

            // Validate leave year start date
            if ($this->has('leave_year_start_month') && $this->has('leave_year_start_day')) {
                $month = $this->leave_year_start_month;
                $day = $this->leave_year_start_day;

                // Check if the day is valid for the given month
                if (!checkdate($month, $day, date('Y'))) {
                    $validator->errors()->add('leave_year_start_day', 'Invalid day for the selected month.');
                }
            }

            // Validate weekend days (at least one day should be working day)
            if ($this->has('weekend_days') && is_array($this->weekend_days)) {
                if (count($this->weekend_days) >= 7) {
                    $validator->errors()->add('weekend_days', 'Cannot set all days as weekend days.');
                }
            }
        });
    }
}
