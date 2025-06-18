<?php

return [
    'name' => 'MobileBridge',

    /*
    |--------------------------------------------------------------------------
    | Mobile Bridge Configuration
    |--------------------------------------------------------------------------
    |
    | This is the configuration for the Mobile Bridge module that handles
    | the connection between the mobile app and the web application.
    |
    */

    // API settings
    'api' => [
        'version' => 'v1',
        'prefix' => 'api/mobile',
        'throttle' => [
            'enabled' => true,
            'max_attempts' => 60,
            'decay_minutes' => 1,
        ],
    ],

    // Authentication settings
    'auth' => [
        'token_expiration' => 60 * 24 * 7, // 1 week in minutes
        'refresh_token_expiration' => 60 * 24 * 30, // 30 days in minutes
    ],

    // Push notification settings
    'push_notifications' => [
        'enabled' => true,
        'service' => 'firebase',
        'firebase' => [
            'server_key' => env('FIREBASE_SERVER_KEY')
        ],
        'vapid' => [
            'subject' => env('VAPID_SUBJECT', 'mailto:admin@example.com'),
            'public_key' => env('VAPID_PUBLIC_KEY'),
            'private_key' => env('VAPID_PRIVATE_KEY'),
        ],
    ],

    // Offline mode settings
    'offline' => [
        'enabled' => true,
        'sync_interval' => 15, // in minutes
        'max_queue_size' => 100, // maximum number of queued operations
    ],

    // PWA settings
    'pwa' => [
        'enabled' => true,
        'manifest' => [
            'name' => 'SND Management App',
            'short_name' => 'SND App',
            'start_url' => '/',
            'display' => 'standalone',
            'background_color' => '#ffffff',
            'theme_color' => '#4A90E2',
        ],
    ],
];

