<?php

return [
    'name' => 'Settings',
    'description' => 'Manage application settings',

    // Cache settings
    'cache' => [
        'enabled' => true,
        'ttl' => 86400, // 24 hours in seconds
    ],

    // Settings groups
    'groups' => [
        'company' => [
            'name' => 'Company',
            'description' => 'Company information and settings',
            'icon' => 'building',
        ],
        'system' => [
            'name' => 'System',
            'description' => 'Application system settings',
            'icon' => 'cog',
        ],
        'notifications' => [
            'name' => 'Notifications',
            'description' => 'Notification preferences and settings',
            'icon' => 'bell',
        ],
        'payroll' => [
            'name' => 'Payroll',
            'description' => 'Payroll processing settings',
            'icon' => 'money',
        ],
    ],

    // Default types and their form components
    'types' => [
        'string' => [
            'component' => 'TextInput',
            'default' => '',
        ],
        'boolean' => [
            'component' => 'ToggleSwitch',
            'default' => false,
        ],
        'integer' => [
            'component' => 'NumberInput',
            'default' => 0,
        ],
        'float' => [
            'component' => 'NumberInput',
            'default' => 0.0,
        ],
        'array' => [
            'component' => 'ArrayInput',
            'default' => []
        ],
        'json' => [
            'component' => 'JsonEditor',
            'default' => '{}',
        ],
    ],
];

