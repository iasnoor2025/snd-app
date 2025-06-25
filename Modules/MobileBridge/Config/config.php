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

    /*
    |--------------------------------------------------------------------------
    | Responsive Design Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for responsive design features including breakpoints,
    | navigation, gestures, and image optimization.
    |
    */
    'responsive' => [
        // Device breakpoints
        'breakpoints' => [
            'mobile' => [
                'xs' => '320px',
                'sm' => '375px',
                'md' => '425px',
                'lg' => '768px',
            ],
            'tablet' => [
                'sm' => '768px',
                'md' => '1024px',
                'lg' => '1280px',
            ],
            'desktop' => [
                'sm' => '1024px',
                'md' => '1280px',
                'lg' => '1440px',
                'xl' => '1920px',
            ],
        ],

        // Navigation configuration
        'navigation' => [
            'mobile' => [
                'type' => 'bottom-nav',
                'collapsible' => true,
                'showLabels' => false,
                'maxItems' => 5,
                'swipeable' => true,
            ],
            'tablet' => [
                'type' => 'side-nav',
                'collapsible' => true,
                'showLabels' => true,
                'maxItems' => 8,
                'swipeable' => true,
            ],
            'desktop' => [
                'type' => 'side-nav',
                'collapsible' => false,
                'showLabels' => true,
                'maxItems' => 12,
                'swipeable' => false,
            ],
        ],

        // Gesture configuration
        'gestures' => [
            'mobile' => [
                'tap' => true,
                'doubleTap' => true,
                'longPress' => true,
                'swipe' => true,
                'pinch' => true,
                'rotate' => true,
                'pan' => true,
                'edgeSwipe' => true,
            ],
            'tablet' => [
                'tap' => true,
                'doubleTap' => true,
                'longPress' => true,
                'swipe' => true,
                'pinch' => true,
                'rotate' => true,
                'pan' => true,
                'edgeSwipe' => true,
            ],
            'desktop' => [
                'tap' => true,
                'doubleTap' => true,
                'longPress' => true,
            ],
        ],

        // Image optimization configuration
        'images' => [
            'mobile' => [
                'quality' => 70,
                'maxWidth' => 768,
                'formats' => ['webp', 'jpeg'],
                'lazyLoad' => true,
                'placeholder' => 'blur',
            ],
            'tablet' => [
                'quality' => 80,
                'maxWidth' => 1280,
                'formats' => ['webp', 'jpeg'],
                'lazyLoad' => true,
                'placeholder' => 'blur',
            ],
            'desktop' => [
                'quality' => 90,
                'maxWidth' => 1920,
                'formats' => ['webp', 'jpeg', 'png'],
                'lazyLoad' => true,
                'placeholder' => 'blur',
            ],
        ],

        // Touch target configuration
        'touchTargets' => [
            'mobile' => [
                'minSize' => '44px',
                'spacing' => '8px',
                'feedback' => true,
                'highlightColor' => 'rgba(0, 0, 0, 0.1)',
            ],
            'tablet' => [
                'minSize' => '40px',
                'spacing' => '8px',
                'feedback' => true,
                'highlightColor' => 'rgba(0, 0, 0, 0.1)',
            ],
            'desktop' => [
                'minSize' => '32px',
                'spacing' => '4px',
                'feedback' => false,
                'highlightColor' => 'transparent',
            ],
        ],

        // Font size configuration
        'fontSizes' => [
            'mobile' => [
                'base' => '16px',
                'scale' => 1.2,
                'lineHeight' => 1.5,
                'minSize' => '12px',
                'maxSize' => '24px',
            ],
            'tablet' => [
                'base' => '16px',
                'scale' => 1.25,
                'lineHeight' => 1.5,
                'minSize' => '12px',
                'maxSize' => '32px',
            ],
            'desktop' => [
                'base' => '16px',
                'scale' => 1.333,
                'lineHeight' => 1.5,
                'minSize' => '12px',
                'maxSize' => '48px',
            ],
        ],

        // Spacing configuration
        'spacing' => [
            'mobile' => [
                'base' => '16px',
                'scale' => 1.5,
                'levels' => 5,
                'minSpace' => '4px',
                'maxSpace' => '32px',
            ],
            'tablet' => [
                'base' => '16px',
                'scale' => 1.5,
                'levels' => 6,
                'minSpace' => '4px',
                'maxSpace' => '48px',
            ],
            'desktop' => [
                'base' => '16px',
                'scale' => 1.5,
                'levels' => 7,
                'minSpace' => '4px',
                'maxSpace' => '64px',
            ],
        ],

        // Cache configuration
        'cache' => [
            'enabled' => true,
            'duration' => 60, // minutes
            'prefix' => 'responsive_layout_',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | PWA Configuration
    |--------------------------------------------------------------------------
    |
    | Progressive Web App configuration including service worker,
    | manifest, and offline support.
    |
    */
    'pwa' => [
        'enabled' => true,
        'name' => 'Rental Management System',
        'shortName' => 'RMS',
        'description' => 'Rental Management System Progressive Web App',
        'backgroundColor' => '#ffffff',
        'themeColor' => '#000000',
        'display' => 'standalone',
        'orientation' => 'portrait',
        'scope' => '/',
        'startUrl' => '/',
        'icons' => [
            [
                'src' => '/images/icons/icon-72x72.png',
                'sizes' => '72x72',
                'type' => 'image/png',
            ],
            [
                'src' => '/images/icons/icon-96x96.png',
                'sizes' => '96x96',
                'type' => 'image/png',
            ],
            [
                'src' => '/images/icons/icon-128x128.png',
                'sizes' => '128x128',
                'type' => 'image/png',
            ],
            [
                'src' => '/images/icons/icon-144x144.png',
                'sizes' => '144x144',
                'type' => 'image/png',
            ],
            [
                'src' => '/images/icons/icon-152x152.png',
                'sizes' => '152x152',
                'type' => 'image/png',
            ],
            [
                'src' => '/images/icons/icon-192x192.png',
                'sizes' => '192x192',
                'type' => 'image/png',
            ],
            [
                'src' => '/images/icons/icon-384x384.png',
                'sizes' => '384x384',
                'type' => 'image/png',
            ],
            [
                'src' => '/images/icons/icon-512x512.png',
                'sizes' => '512x512',
                'type' => 'image/png',
            ],
        ],
        'splash' => [
            [
                'src' => '/images/splash/splash-640x1136.png',
                'media' => '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)',
            ],
            [
                'src' => '/images/splash/splash-750x1334.png',
                'media' => '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)',
            ],
            [
                'src' => '/images/splash/splash-828x1792.png',
                'media' => '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)',
            ],
            [
                'src' => '/images/splash/splash-1242x2208.png',
                'media' => '(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)',
            ],
            [
                'src' => '/images/splash/splash-1242x2688.png',
                'media' => '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)',
            ],
            [
                'src' => '/images/splash/splash-1536x2048.png',
                'media' => '(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)',
            ],
            [
                'src' => '/images/splash/splash-1668x2224.png',
                'media' => '(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2)',
            ],
            [
                'src' => '/images/splash/splash-1668x2388.png',
                'media' => '(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)',
            ],
            [
                'src' => '/images/splash/splash-2048x2732.png',
                'media' => '(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)',
            ],
        ],
        'shortcuts' => [
            [
                'name' => 'Dashboard',
                'description' => 'View your dashboard',
                'url' => '/dashboard',
                'icons' => [
                    [
                        'src' => '/images/icons/dashboard-192x192.png',
                        'sizes' => '192x192',
                        'type' => 'image/png',
                    ],
                ],
            ],
            [
                'name' => 'Rentals',
                'description' => 'Manage rentals',
                'url' => '/rentals',
                'icons' => [
                    [
                        'src' => '/images/icons/rentals-192x192.png',
                        'sizes' => '192x192',
                        'type' => 'image/png',
                    ],
                ],
            ],
        ],
        'serviceWorker' => [
            'src' => '/service-worker.js',
            'scope' => '/',
            'updateViaCache' => 'none',
            'cacheFirst' => [
                '/css/',
                '/js/',
                '/images/',
                '/fonts/',
            ],
            'networkFirst' => [
                '/api/',
                '/dashboard',
                '/rentals',
            ],
            'staleWhileRevalidate' => [
                '/icons/',
                '/manifest.json',
            ],
            'precache' => [
                '/offline',
                '/css/app.css',
                '/js/app.js',
                '/images/logo.png',
            ],
        ],
    ],
];

