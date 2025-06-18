<?php

return [
    'name' => 'EquipmentManagement',

    /*
    |--------------------------------------------------------------------------
    | Equipment Management Configuration
    |--------------------------------------------------------------------------
    |
    | This is the configuration for the Equipment Management module.
    |
    */

    // Equipment settings
    'equipment' => [
        'statuses' => [
            'available',
            'in_use',
            'under_maintenance',
            'out_of_service',
            'retired',
        ],
        'types' => [
            'heavy_equipment',
            'light_equipment',
            'tools',
            'vehicles',
            'electronics',
        ],
    ],

    // Maintenance settings
    'maintenance' => [
        'types' => [
            'routine',
            'preventive',
            'corrective',
            'emergency',
        ],
        'schedule_reminder_days' => 7, // Send reminders 7 days before scheduled maintenance
    ],

    // Depreciation settings
    'depreciation' => [
        'methods' => [
            'straight_line',
            'declining_balance',
            'sum_of_years_digits',
        ],
        'default_method' => 'straight_line',
    ],
];
