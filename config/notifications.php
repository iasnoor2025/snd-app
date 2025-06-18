<?php

return [
    'name' => 'Notifications',

    /*
    |--------------------------------------------------------------------------
    | Notifications Configuration
    |--------------------------------------------------------------------------
    |
    | This is the configuration for the Notifications module.
    |
    */

    // Notification settings
    'settings' => [
        'default_channel' => 'database',
        'available_channels' => ['database', 'mail', 'sms', 'slack']
    ],

    // Email notification settings
    'email' => [
        'enabled' => true,
        'from' => [
            'address' => env('MAIL_FROM_ADDRESS', 'hello@example.com'),
            'name' => env('MAIL_FROM_NAME', 'Example'),
        ],
    ],

    // SMS notification settings
    'sms' => [
        'enabled' => false,
        'provider' => 'twilio',
    ],

    // Push notification settings
    'push' => [
        'enabled' => false,
        'provider' => 'firebase',
    ],
];

