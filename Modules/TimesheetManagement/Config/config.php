<?php

return [
    'name' => 'TimesheetManagement',

    // Default working hours per day
    'default_working_hours' => 8,

    // Standard work week days (1 = Monday, 7 = Sunday)
    'work_days' => [1, 2, 3, 4, 5], // Monday to Friday

    // Whether to allow timesheet submission for future dates
    'allow_future_submissions' => false,

    // Maximum days in the past for which a timesheet can be submitted or edited
    'max_past_days_editable' => 14,

    // Whether to allow overtime entries
    'allow_overtime' => true,

    // Whether to require project assignment for all time entries
    'require_project_assignment' => true,

    // Whether to require task assignment for all time entries
    'require_task_assignment' => true,

    // Timesheet approval settings
    'approval' => [
        'enabled' => true,
        'levels' => 1, // Number of approval levels
        'auto_approval_after_days' => 0, // 0 means no auto-approval
    ],

    // Time entry rounding settings (in minutes)
    'time_rounding' => [
        'enabled' => true,
        'increment' => 15, // Round to nearest 15 minutes
        'method' => 'nearest', // Options: nearest, up, down
    ],

    // Notification settings
    'notifications' => [
        'reminder_day' => 5, // Day of the week to send reminders (5 = Friday)
        'send_daily_reminders' => false,
        'send_weekly_reminders' => true,
        'notify_manager_on_submission' => true,
        'notify_employee_on_approval' => true,
    ],

    // Timesheet lock settings
    'lock_timesheet_after_approval' => true,

    // Export settings
    'export_formats' => ['csv', 'xlsx', 'pdf']
];

