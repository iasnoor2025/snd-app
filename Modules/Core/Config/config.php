<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Core Module Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains the configuration settings for the Core module.
    |
    */

    'name' => 'Core',
    'description' => 'Core functionality for the SND Rental application',

    /*
    |--------------------------------------------------------------------------
    | Module Settings
    |--------------------------------------------------------------------------
    */

    'settings' => [
        'cache' => [
            'enabled' => true,
            'ttl' => 3600, // 1 hour
        ],
        'logging' => [
            'enabled' => true,
            'channel' => 'stack',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Module Dependencies
    |--------------------------------------------------------------------------
    */

    'dependencies' => [
        // List of modules that this module depends on
    ],

    /*
    |--------------------------------------------------------------------------
    | Module Events
    |--------------------------------------------------------------------------
    */

    'events' => [
        'enabled' => true,
        'listeners' => [
            // List of event listeners
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Module Middleware
    |--------------------------------------------------------------------------
    */

    'middleware' => [
        'web' => [
            // Web middleware group
        ],
        'api' => [
            // API middleware group
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Module Routes
    |--------------------------------------------------------------------------
    */

    'routes' => [
        'prefix' => 'core',
        'middleware' => ['web']
    ],

    /*
    |--------------------------------------------------------------------------
    | Module Views
    |--------------------------------------------------------------------------
    */

    'views' => [
        'namespace' => 'core',
        'path' => 'resources/views/modules/core',
    ],

    /*
    |--------------------------------------------------------------------------
    | Module Translations
    |--------------------------------------------------------------------------
    */

    'translations' => [
        'namespace' => 'core',
        'path' => 'resources/lang/modules/core',
    ],

    'providers' => [
        'Modules\Core\Providers\CoreServiceProvider',
        'Modules\Core\Providers\RouteServiceProvider',
        'Modules\Core\Providers\EventServiceProvider',
        'Modules\Core\Providers\ToastServiceProvider',
    ],
];

