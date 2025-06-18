<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Mobile Geofencing Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains all the configuration options for the mobile
    | geofencing system including GPS settings, violation policies,
    | notification preferences, and security settings.
    |
    */

    /*
    |--------------------------------------------------------------------------
    | GPS and Location Settings
    |--------------------------------------------------------------------------
    */
    'gps' => [
        // Minimum GPS accuracy required (in meters)
        'min_accuracy' => env('GEOFENCE_MIN_ACCURACY', 50),

        // Maximum GPS accuracy allowed (in meters)
        'max_accuracy' => env('GEOFENCE_MAX_ACCURACY', 500),

        // Location update interval (in seconds)
        'update_interval' => env('GEOFENCE_UPDATE_INTERVAL', 30),

        // Maximum age of location data (in seconds)
        'max_location_age' => env('GEOFENCE_MAX_LOCATION_AGE', 300),

        // Enable high accuracy GPS mode
        'high_accuracy' => env('GEOFENCE_HIGH_ACCURACY', true),

        // GPS timeout (in seconds)
        'timeout' => env('GEOFENCE_GPS_TIMEOUT', 15),

        // Number of location points to keep in history
        'history_limit' => env('GEOFENCE_HISTORY_LIMIT', 100),

        // Minimum distance between location updates (in meters)
        'min_distance_filter' => env('GEOFENCE_MIN_DISTANCE', 10),
    ],

    /*
    |--------------------------------------------------------------------------
    | Geofence Zone Settings
    |--------------------------------------------------------------------------
    */
    'zones' => [
        // Default zone radius (in meters)
        'default_radius' => env('GEOFENCE_DEFAULT_RADIUS', 100),

        // Minimum zone radius (in meters)
        'min_radius' => env('GEOFENCE_MIN_RADIUS', 10),

        // Maximum zone radius (in meters)
        'max_radius' => env('GEOFENCE_MAX_RADIUS', 5000),

        // Buffer zone for soft enforcement (in meters)
        'buffer_zone' => env('GEOFENCE_BUFFER_ZONE', 20),

        // Maximum number of polygon points
        'max_polygon_points' => env('GEOFENCE_MAX_POLYGON_POINTS', 50),

        // Zone types and their default settings
        'types' => [
            'project_site' => [
                'name' => 'Project Site',
                'color' => '#3B82F6',
                'icon' => 'building',
                'strict_enforcement' => true,
                'priority' => 1,
            ],
            'office' => [
                'name' => 'Office',
                'color' => '#10B981',
                'icon' => 'building-2',
                'strict_enforcement' => false,
                'priority' => 2,
            ],
            'warehouse' => [
                'name' => 'Warehouse',
                'color' => '#F59E0B',
                'icon' => 'warehouse',
                'strict_enforcement' => true,
                'priority' => 3,
            ],
            'restricted' => [
                'name' => 'Restricted Area',
                'color' => '#EF4444',
                'icon' => 'shield-alert',
                'strict_enforcement' => true,
                'priority' => 0,
            ],
            'custom' => [
                'name' => 'Custom Zone',
                'color' => '#8B5CF6',
                'icon' => 'map-pin',
                'strict_enforcement' => false,
                'priority' => 4,
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Violation Detection Settings
    |--------------------------------------------------------------------------
    */
    'violations' => [
        // Enable violation detection
        'enabled' => env('GEOFENCE_VIOLATIONS_ENABLED', true),

        // Violation detection sensitivity
        'sensitivity' => env('GEOFENCE_VIOLATION_SENSITIVITY', 'medium'), // low, medium, high

        // Minimum time outside zone before violation (in seconds)
        'min_violation_duration' => env('GEOFENCE_MIN_VIOLATION_DURATION', 60),

        // Maximum violations per day before escalation
        'max_daily_violations' => env('GEOFENCE_MAX_DAILY_VIOLATIONS', 5),

        // Violation types and their severity levels
        'types' => [
            'outside_zone' => [
                'name' => 'Outside Authorized Zone',
                'default_severity' => 'medium',
                'auto_escalate' => true,
                'escalation_threshold' => 3,
            ],
            'unauthorized_zone' => [
                'name' => 'In Unauthorized Zone',
                'default_severity' => 'high',
                'auto_escalate' => true,
                'escalation_threshold' => 1,
            ],
            'time_restriction' => [
                'name' => 'Time Restriction Violation',
                'default_severity' => 'medium',
                'auto_escalate' => false,
                'escalation_threshold' => 5,
            ],
            'accuracy_low' => [
                'name' => 'Low GPS Accuracy',
                'default_severity' => 'low',
                'auto_escalate' => false,
                'escalation_threshold' => 10,
            ],
            'suspicious_location' => [
                'name' => 'Suspicious Location Pattern',
                'default_severity' => 'high',
                'auto_escalate' => true,
                'escalation_threshold' => 2,
            ],
        ],

        // Severity levels and their thresholds
        'severity_levels' => [
            'low' => [
                'name' => 'Low',
                'color' => '#3B82F6',
                'distance_threshold' => 50, // meters
                'duration_threshold' => 300, // seconds
                'auto_notify' => false,
            ],
            'medium' => [
                'name' => 'Medium',
                'color' => '#F59E0B',
                'distance_threshold' => 100, // meters
                'duration_threshold' => 180, // seconds
                'auto_notify' => true,
            ],
            'high' => [
                'name' => 'High',
                'color' => '#EF4444',
                'distance_threshold' => 200, // meters
                'duration_threshold' => 60, // seconds
                'auto_notify' => true,
            ],
            'critical' => [
                'name' => 'Critical',
                'color' => '#DC2626',
                'distance_threshold' => 500, // meters
                'duration_threshold' => 30, // seconds
                'auto_notify' => true,
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Notification Settings
    |--------------------------------------------------------------------------
    */
    'notifications' => [
        // Enable notifications
        'enabled' => env('GEOFENCE_NOTIFICATIONS_ENABLED', true),

        // Notification channels
        'channels' => [
            'mail' => env('GEOFENCE_NOTIFY_MAIL', true),
            'database' => env('GEOFENCE_NOTIFY_DATABASE', true),
            'broadcast' => env('GEOFENCE_NOTIFY_BROADCAST', true),
            'sms' => env('GEOFENCE_NOTIFY_SMS', false),
            'push' => env('GEOFENCE_NOTIFY_PUSH', true),
        ],

        // Notification recipients
        'recipients' => [
            'employee' => [
                'enabled' => true,
                'channels' => ['database', 'push'],
                'severity_threshold' => 'medium',
            ],
            'project_manager' => [
                'enabled' => true,
                'channels' => ['mail', 'database'],
                'severity_threshold' => 'medium',
            ],
            'hr_manager' => [
                'enabled' => true,
                'channels' => ['mail', 'database'],
                'severity_threshold' => 'high',
            ],
            'system_admin' => [
                'enabled' => true,
                'channels' => ['mail', 'database', 'sms'],
                'severity_threshold' => 'critical',
            ],
        ],

        // Notification throttling (to prevent spam)
        'throttling' => [
            'enabled' => true,
            'max_per_hour' => 10,
            'max_per_day' => 50,
            'cooldown_period' => 300, // seconds
        ],

        // Email templates
        'templates' => [
            'violation_detected' => 'timesheet::emails.geofence_violation',
            'violation_resolved' => 'timesheet::emails.geofence_resolved',
            'daily_summary' => 'timesheet::emails.geofence_daily_summary',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Mobile App Settings
    |--------------------------------------------------------------------------
    */
    'mobile' => [
        // Enable offline mode
        'offline_mode' => env('GEOFENCE_OFFLINE_MODE', true),

        // Maximum offline entries to store
        'max_offline_entries' => env('GEOFENCE_MAX_OFFLINE_ENTRIES', 100),

        // Auto-sync interval (in seconds)
        'auto_sync_interval' => env('GEOFENCE_AUTO_SYNC_INTERVAL', 300),

        // Background location tracking
        'background_tracking' => env('GEOFENCE_BACKGROUND_TRACKING', true),

        // Battery optimization settings
        'battery_optimization' => [
            'enabled' => true,
            'low_battery_threshold' => 20, // percentage
            'reduce_accuracy_on_low_battery' => true,
            'increase_update_interval_on_low_battery' => true,
        ],

        // App version requirements
        'min_app_version' => env('GEOFENCE_MIN_APP_VERSION', '1.0.0'),
        'supported_platforms' => ['ios', 'android', 'web'],

        // Device requirements
        'device_requirements' => [
            'gps_required' => true,
            'network_required' => false, // can work offline
            'camera_required' => false,
            'min_storage_mb' => 50,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Security Settings
    |--------------------------------------------------------------------------
    */
    'security' => [
        // Enable location verification
        'location_verification' => env('GEOFENCE_LOCATION_VERIFICATION', true),

        // Anti-spoofing measures
        'anti_spoofing' => [
            'enabled' => true,
            'check_mock_locations' => true,
            'check_developer_options' => true,
            'check_root_jailbreak' => true,
            'verify_location_consistency' => true,
        ],

        // Device fingerprinting
        'device_fingerprinting' => [
            'enabled' => true,
            'track_device_changes' => true,
            'max_devices_per_user' => 3,
            'device_registration_required' => false,
        ],

        // Data encryption
        'encryption' => [
            'encrypt_location_data' => true,
            'encrypt_offline_data' => true,
            'encryption_algorithm' => 'AES-256-CBC',
        ],

        // Audit logging
        'audit_logging' => [
            'enabled' => true,
            'log_location_updates' => false, // can be very verbose
            'log_violations' => true,
            'log_admin_actions' => true,
            'retention_days' => 90,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Performance Settings
    |--------------------------------------------------------------------------
    */
    'performance' => [
        // Caching settings
        'cache' => [
            'enabled' => true,
            'ttl' => 3600, // seconds
            'store' => env('GEOFENCE_CACHE_STORE', 'redis'),
        ],

        // Database optimization
        'database' => [
            'batch_insert_size' => 100,
            'cleanup_old_data' => true,
            'cleanup_interval_days' => 90,
            'index_optimization' => true,
        ],

        // API rate limiting
        'rate_limiting' => [
            'enabled' => true,
            'requests_per_minute' => 60,
            'burst_limit' => 10,
        ],

        // Background job settings
        'jobs' => [
            'queue' => env('GEOFENCE_QUEUE', 'default'),
            'max_retries' => 3,
            'retry_delay' => 60, // seconds
            'timeout' => 300, // seconds
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Integration Settings
    |--------------------------------------------------------------------------
    */
    'integrations' => [
        // Google Maps API
        'google_maps' => [
            'enabled' => env('GOOGLE_MAPS_ENABLED', false),
            'api_key' => env('GOOGLE_MAPS_API_KEY'),
            'geocoding' => true,
            'reverse_geocoding' => true,
        ],

        // OpenStreetMap
        'openstreetmap' => [
            'enabled' => env('OSM_ENABLED', true),
            'nominatim_url' => env('OSM_NOMINATIM_URL', 'https://nominatim.openstreetmap.org'),
            'user_agent' => env('OSM_USER_AGENT', 'TimesheetApp/1.0'),
        ],

        // Third-party geofencing services
        'external_services' => [
            'enabled' => false,
            'primary_service' => null,
            'fallback_service' => null,
        ],

        // Webhook notifications
        'webhooks' => [
            'enabled' => env('GEOFENCE_WEBHOOKS_ENABLED', false),
            'endpoints' => [
                // 'violation_detected' => env('WEBHOOK_VIOLATION_URL'),
                // 'daily_summary' => env('WEBHOOK_SUMMARY_URL'),
            ],
            'timeout' => 30,
            'retries' => 3,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Compliance and Privacy Settings
    |--------------------------------------------------------------------------
    */
    'compliance' => [
        // GDPR compliance
        'gdpr' => [
            'enabled' => env('GEOFENCE_GDPR_ENABLED', true),
            'consent_required' => true,
            'data_retention_days' => 365,
            'right_to_deletion' => true,
            'data_portability' => true,
        ],

        // Privacy settings
        'privacy' => [
            'anonymize_location_data' => false,
            'blur_home_locations' => true,
            'home_location_radius' => 200, // meters
            'allow_location_sharing' => false,
        ],

        // Legal requirements
        'legal' => [
            'employee_consent_required' => true,
            'union_notification_required' => false,
            'local_law_compliance' => true,
            'data_processing_agreement' => true,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Reporting and Analytics
    |--------------------------------------------------------------------------
    */
    'reporting' => [
        // Enable reporting features
        'enabled' => true,

        // Report types
        'types' => [
            'daily_summary' => true,
            'weekly_summary' => true,
            'monthly_summary' => true,
            'violation_report' => true,
            'compliance_report' => true,
            'performance_report' => true,
        ],

        // Automated reports
        'automated' => [
            'enabled' => true,
            'daily_summary_time' => '08:00',
            'weekly_summary_day' => 'monday',
            'monthly_summary_day' => 1,
            'recipients' => [
                'hr@company.com',
                'admin@company.com',
            ],
        ],

        // Data export
        'export' => [
            'formats' => ['csv', 'excel', 'pdf'],
            'max_records' => 10000,
            'include_personal_data' => false,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Development and Testing Settings
    |--------------------------------------------------------------------------
    */
    'development' => [
        // Debug mode
        'debug' => env('GEOFENCE_DEBUG', false),

        // Mock location for testing
        'mock_location' => [
            'enabled' => env('GEOFENCE_MOCK_LOCATION', false),
            'latitude' => env('GEOFENCE_MOCK_LAT', 40.7128),
            'longitude' => env('GEOFENCE_MOCK_LNG', -74.0060),
            'accuracy' => env('GEOFENCE_MOCK_ACCURACY', 10),
        ],

        // Testing features
        'testing' => [
            'simulate_violations' => false,
            'bypass_security_checks' => false,
            'log_all_events' => false,
        ],

        // Development tools
        'tools' => [
            'location_simulator' => false,
            'violation_generator' => false,
            'performance_profiler' => false,
        ],
    ],
];
