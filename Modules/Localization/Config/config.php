<?php

return [
    'name' => 'Localization',

    /*
    |--------------------------------------------------------------------------
    | Localization Configuration
    |--------------------------------------------------------------------------
    |
    | This is the configuration for the Localization module.
    |
    */

    // Language settings
    'languages' => [
        'default' => 'en',
        'available' => [
            'en' => 'English',
            'ar' => 'Arabic',
            'hi' => 'Hindi',
            'bn' => 'Bengali',
            'ur' => 'Urdu',
        ],
    ],

    // Currency settings
    'currencies' => [
        'default' => 'SAR',
        'available' => [
            'SAR' => [
                'name' => 'Saudi Riyal',
                'symbol' => 'ر.س',
            ]
        ],
    ],

    // Date format settings
    'date_formats' => [
        'default' => 'Y-m-d',
        'available' => [
            'Y-m-d' => 'YYYY-MM-DD',
            'd/m/Y' => 'DD/MM/YYYY',
            'm/d/Y' => 'MM/DD/YYYY',
        ],
    ],

    // Time format settings
    'time_formats' => [
        'default' => 'H:i',
        'available' => [
            'H:i' => '24 Hour (e.g. 14:30)',
            'h:i A' => '12 Hour (e.g. 02:30 PM)',
        ],
    ],
];
