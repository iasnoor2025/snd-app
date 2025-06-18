<?php

return [
    'name' => 'LeaveManagement',

    // Leave types and their default allowances per year
    'leave_types' => [
        'annual' => 20,
        'sick' => 10,
        'maternity' => 90,
        'paternity' => 10,
        'compassionate' => 5,
        'unpaid' => 0,
    ],

    // Number of days before which a leave request needs to be submitted
    'advance_request_days' => 7,

    // Minimum number of consecutive days for which advance approval is mandatory
    'min_days_for_advance_approval' => 3,

    // Whether to allow half-day leaves
    'allow_half_day' => true,

    // Whether to allow carrying forward unused leaves to next year
    'allow_carry_forward' => true,

    // Maximum leaves that can be carried forward to next year
    'max_carry_forward' => 10,

    // Whether to allow encashment of unused leaves
    'allow_encashment' => true,

    // Maximum leaves that can be encashed per year
    'max_encashment' => 5,
];
