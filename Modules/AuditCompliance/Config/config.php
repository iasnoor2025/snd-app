<?php

return [
    'name' => 'AuditCompliance',

    /*
    |--------------------------------------------------------------------------
    | Audit Logging Configuration
    |--------------------------------------------------------------------------
    |
    | Configure how audit logs are captured and stored.
    |
    */
    'audit' => [
        // Enable/disable audit logging globally
        'enabled' => env('AUDIT_ENABLED', true),

        // Events to automatically log
        'events' => [
            'created' => true,
            'updated' => true,
            'deleted' => true,
            'restored' => true,
        ],

        // Models to exclude from automatic audit logging
        'exclude_models' => [
            // 'App\\Models\\SensitiveModel',
        ],

        // Attributes to exclude from audit logs (sensitive data)
        'exclude_attributes' => [
            'password',
            'password_confirmation',
            'remember_token',
            'api_token',
            'two_factor_secret',
            'two_factor_recovery_codes',
        ],

        // Maximum number of old/new values to store (null = unlimited)
        'max_attribute_size' => 65535,

        // Store user agent information
        'store_user_agent' => true,

        // Store IP address
        'store_ip_address' => true,

        // Store URL
        'store_url' => true,

        // Legacy purge setting (use retention policies instead)
        'purge_after_days' => 365,
    ],

    /*
    |--------------------------------------------------------------------------
    | Data Retention Configuration
    |--------------------------------------------------------------------------
    |
    | Configure default data retention policies.
    |
    */
    'retention' => [
        // Default retention periods (in days)
        'defaults' => [
            'audit_logs' => 2555, // 7 years
            'user_activity' => 1095, // 3 years
            'session_data' => 90, // 3 months
            'temporary_files' => 30, // 1 month
            'gdpr_requests' => 2555, // 7 years
            'consent_records' => 2555, // 7 years
        ],

        // Legacy periods (for backward compatibility)
        'periods' => [
            'financial' => 7, // 7 years for financial data
            'employee' => 5, // 5 years for employee data
            'equipment' => 10, // 10 years for equipment records
        ],

        // Enable automatic execution of retention policies
        'auto_execute' => env('RETENTION_AUTO_EXECUTE', false),

        // Batch size for processing records
        'batch_size' => 1000,

        // Maximum execution time per policy (in seconds)
        'max_execution_time' => 3600, // 1 hour

        // Enable soft deletes for retention (recommended)
        'use_soft_deletes' => true,

        // Days to keep soft deleted records before permanent deletion
        'soft_delete_grace_period' => 30,
    ],

    /*
    |--------------------------------------------------------------------------
    | GDPR Configuration
    |--------------------------------------------------------------------------
    |
    | Configure GDPR compliance features.
    |
    */
    'gdpr' => [
        // Default response time for GDPR requests (in days)
        'default_response_time' => 30,

        // Enable automatic request ID generation
        'auto_generate_request_id' => true,

        // Request ID format (use {year}, {month}, {day}, {sequence})
        'request_id_format' => 'GDPR-{year}-{sequence}',

        // Enable email notifications for new requests
        'notify_on_new_request' => true,

        // Enable email notifications for overdue requests
        'notify_on_overdue' => true,

        // Days before due date to send reminder notifications
        'reminder_days' => [7, 3, 1],

        // Supported request types
        'request_types' => [
            'access' => 'Data Access Request',
            'rectification' => 'Data Rectification Request',
            'erasure' => 'Data Erasure Request',
            'portability' => 'Data Portability Request',
            'restriction' => 'Processing Restriction Request',
            'objection' => 'Processing Objection Request',
        ],

        // Data export format
        'export_format' => 'json', // json, csv, xml

        // Include related data in exports
        'include_related_data' => true,

        // Anonymize exported data
        'anonymize_exports' => false,
    ],

    /*
    |--------------------------------------------------------------------------
    | Consent Management Configuration
    |--------------------------------------------------------------------------
    |
    | Configure consent tracking and management.
    |
    */
    'consent' => [
        // Default consent types
        'types' => [
            'marketing' => 'Marketing Communications',
            'analytics' => 'Analytics and Performance',
            'functional' => 'Functional Cookies',
            'advertising' => 'Advertising and Targeting',
            'data_processing' => 'Data Processing',
        ],

        // Default consent expiry period (in days, null = no expiry)
        'default_expiry_days' => 365,

        // Require explicit consent (vs implied)
        'require_explicit_consent' => true,

        // Enable consent versioning
        'enable_versioning' => true,

        // Automatically expire consents
        'auto_expire' => true,

        // Send renewal reminders
        'send_renewal_reminders' => true,

        // Days before expiry to send renewal reminder
        'renewal_reminder_days' => 30,
    ],

    /*
    |--------------------------------------------------------------------------
    | Compliance Reporting Configuration
    |--------------------------------------------------------------------------
    |
    | Configure compliance report generation.
    |
    */
    'reporting' => [
        // Available report types
        'types' => [
            'audit_activity' => 'Audit Activity Report',
            'gdpr_compliance' => 'GDPR Compliance Report',
            'data_retention' => 'Data Retention Report',
            'user_consent' => 'User Consent Report',
            'security_events' => 'Security Events Report',
        ],

        // Default report format
        'default_format' => 'pdf', // pdf, html, csv, json

        // Report storage path (relative to storage/app)
        'storage_path' => 'compliance-reports',

        // Automatically delete old reports (in days, null = never delete)
        'auto_delete_after_days' => 365,

        // Include charts and graphs in reports
        'include_charts' => true,

        // Report generation timeout (in seconds)
        'generation_timeout' => 300,

        // Maximum records per report
        'max_records_per_report' => 10000,
    ],

    /*
    |--------------------------------------------------------------------------
    | Legacy Compliance Configuration
    |--------------------------------------------------------------------------
    |
    | Legacy compliance settings for backward compatibility.
    |
    */
    'compliance' => [
        'types' => [
            'system_access',
            'data_modification',
            'financial_transactions',
            'equipment_usage',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Notification Configuration
    |--------------------------------------------------------------------------
    |
    | Configure compliance-related notifications.
    |
    */
    'notifications' => [
        // Enable email notifications
        'email_enabled' => env('COMPLIANCE_EMAIL_NOTIFICATIONS', true),

        // Enable database notifications
        'database_enabled' => true,

        // Enable Slack notifications (requires slack notification channel)
        'slack_enabled' => env('COMPLIANCE_SLACK_NOTIFICATIONS', false),

        // Slack webhook URL
        'slack_webhook_url' => env('COMPLIANCE_SLACK_WEBHOOK'),

        // Default notification recipients (email addresses)
        'default_recipients' => [
            // 'compliance@example.com',
            // 'admin@example.com',
        ],

        // Notification frequency for non-urgent issues
        'digest_frequency' => 'daily', // daily, weekly, monthly

        // Send notifications only during business hours
        'business_hours_only' => false,

        // Business hours (24-hour format)
        'business_hours' => [
            'start' => '09:00',
            'end' => '17:00',
        ],

        // Business days (0 = Sunday, 6 = Saturday)
        'business_days' => [1, 2, 3, 4, 5], // Monday to Friday
    ],

    /*
    |--------------------------------------------------------------------------
    | Security Configuration
    |--------------------------------------------------------------------------
    |
    | Configure security-related settings.
    |
    */
    'security' => [
        // Encrypt sensitive data in audit logs
        'encrypt_sensitive_data' => true,

        // Hash IP addresses for privacy
        'hash_ip_addresses' => false,

        // Require authentication for all compliance endpoints
        'require_authentication' => true,

        // Required permissions for compliance access
        'required_permissions' => [
            'view_audit_logs',
            'manage_compliance',
        ],

        // Enable rate limiting for compliance endpoints
        'enable_rate_limiting' => true,

        // Rate limit (requests per minute)
        'rate_limit' => 60,

        // Enable CSRF protection
        'csrf_protection' => true,

        // Allowed file types for uploads
        'allowed_file_types' => ['pdf', 'doc', 'docx', 'txt', 'csv', 'json'],

        // Maximum file size for uploads (in KB)
        'max_file_size' => 10240, // 10MB
    ],

    /*
    |--------------------------------------------------------------------------
    | Performance Configuration
    |--------------------------------------------------------------------------
    |
    | Configure performance-related settings.
    |
    */
    'performance' => [
        // Enable query caching
        'enable_caching' => true,

        // Cache TTL (in seconds)
        'cache_ttl' => 3600, // 1 hour

        // Cache key prefix
        'cache_prefix' => 'audit_compliance',

        // Enable database indexing recommendations
        'suggest_indexes' => true,

        // Queue compliance jobs
        'queue_jobs' => true,

        // Default queue for compliance jobs
        'default_queue' => 'compliance',

        // Enable background processing
        'background_processing' => true,
    ],
];
