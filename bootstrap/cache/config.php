<?php return array (
  2 => 'broadcasting',
  4 => 'concurrency',
  8 => 'hashing',
  14 => 'view',
  'activitylog' => 
  array (
    'enabled' => true,
    'delete_records_older_than_days' => 365,
    'default_log_name' => 'default',
    'default_auth_driver' => NULL,
    'subject_returns_soft_deleted_models' => false,
    'activity_model' => 'Spatie\\Activitylog\\Models\\Activity',
    'table_name' => 'activity_log',
    'database_connection' => NULL,
  ),
  'api' => 
  array (
    'name' => 'API',
    'version' => '1.0.0',
    'description' => 'API module for HR & Payroll system',
    'throttle' => 
    array (
      'enabled' => true,
      'limit' => 60,
      'decay_minutes' => 1,
    ),
    'auth' => 
    array (
      'token_expiration' => 1440,
      'refresh_token_expiration' => 10080,
    ),
    'documentation' => 
    array (
      'enabled' => true,
      'path' => '/api/documentation',
    ),
    'versioning' => 
    array (
      'default' => 'v1',
      'supported' => 
      array (
        0 => 'v1',
      ),
    ),
  ),
  'app' => 
  array (
    'name' => 'Laravel',
    'env' => 'local',
    'debug' => true,
    'url' => 'https://snd-app.test',
    'frontend_url' => 'http://localhost:3000',
    'asset_url' => NULL,
    'timezone' => 'UTC',
    'locale' => 'en',
    'fallback_locale' => 'en',
    'faker_locale' => 'en_US',
    'cipher' => 'AES-256-CBC',
    'key' => 'base64:HuWCUgVjNmenyARQo3LD94Y+B2tCxBiIaoxZS0J0lTg=',
    'previous_keys' => 
    array (
    ),
    'maintenance' => 
    array (
      'driver' => 'file',
      'store' => 'database',
    ),
    'providers' => 
    array (
      0 => 'Illuminate\\Auth\\AuthServiceProvider',
      1 => 'Illuminate\\Broadcasting\\BroadcastServiceProvider',
      2 => 'Illuminate\\Bus\\BusServiceProvider',
      3 => 'Illuminate\\Cache\\CacheServiceProvider',
      4 => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
      5 => 'Illuminate\\Cookie\\CookieServiceProvider',
      6 => 'Illuminate\\Database\\DatabaseServiceProvider',
      7 => 'Illuminate\\Encryption\\EncryptionServiceProvider',
      8 => 'Illuminate\\Filesystem\\FilesystemServiceProvider',
      9 => 'Illuminate\\Foundation\\Providers\\FoundationServiceProvider',
      10 => 'Illuminate\\Hashing\\HashServiceProvider',
      11 => 'Illuminate\\Mail\\MailServiceProvider',
      12 => 'Illuminate\\Notifications\\NotificationServiceProvider',
      13 => 'Illuminate\\Pagination\\PaginationServiceProvider',
      14 => 'Illuminate\\Pipeline\\PipelineServiceProvider',
      15 => 'Illuminate\\Queue\\QueueServiceProvider',
      16 => 'Illuminate\\Redis\\RedisServiceProvider',
      17 => 'Illuminate\\Auth\\Passwords\\PasswordResetServiceProvider',
      18 => 'Illuminate\\Session\\SessionServiceProvider',
      19 => 'Illuminate\\Translation\\TranslationServiceProvider',
      20 => 'Illuminate\\Validation\\ValidationServiceProvider',
      21 => 'Illuminate\\View\\ViewServiceProvider',
      22 => 'App\\Providers\\AppServiceProvider',
      23 => 'App\\Providers\\AvatarServiceProvider',
      24 => 'App\\Providers\\PermissionMiddlewareServiceProvider',
      25 => 'App\\Providers\\AppServiceProvider',
    ),
    'aliases' => 
    array (
      'App' => 'Illuminate\\Support\\Facades\\App',
      'Arr' => 'Illuminate\\Support\\Arr',
      'Artisan' => 'Illuminate\\Support\\Facades\\Artisan',
      'Auth' => 'Illuminate\\Support\\Facades\\Auth',
      'Blade' => 'Illuminate\\Support\\Facades\\Blade',
      'Broadcast' => 'Illuminate\\Support\\Facades\\Broadcast',
      'Bus' => 'Illuminate\\Support\\Facades\\Bus',
      'Cache' => 'Illuminate\\Support\\Facades\\Cache',
      'Concurrency' => 'Illuminate\\Support\\Facades\\Concurrency',
      'Config' => 'Illuminate\\Support\\Facades\\Config',
      'Context' => 'Illuminate\\Support\\Facades\\Context',
      'Cookie' => 'Illuminate\\Support\\Facades\\Cookie',
      'Crypt' => 'Illuminate\\Support\\Facades\\Crypt',
      'Date' => 'Illuminate\\Support\\Facades\\Date',
      'DB' => 'Illuminate\\Support\\Facades\\DB',
      'Eloquent' => 'Illuminate\\Database\\Eloquent\\Model',
      'Event' => 'Illuminate\\Support\\Facades\\Event',
      'File' => 'Illuminate\\Support\\Facades\\File',
      'Gate' => 'Illuminate\\Support\\Facades\\Gate',
      'Hash' => 'Illuminate\\Support\\Facades\\Hash',
      'Http' => 'Illuminate\\Support\\Facades\\Http',
      'Js' => 'Illuminate\\Support\\Js',
      'Lang' => 'Illuminate\\Support\\Facades\\Lang',
      'Log' => 'Illuminate\\Support\\Facades\\Log',
      'Mail' => 'Illuminate\\Support\\Facades\\Mail',
      'Notification' => 'Illuminate\\Support\\Facades\\Notification',
      'Number' => 'Illuminate\\Support\\Number',
      'Password' => 'Illuminate\\Support\\Facades\\Password',
      'Process' => 'Illuminate\\Support\\Facades\\Process',
      'Queue' => 'Illuminate\\Support\\Facades\\Queue',
      'RateLimiter' => 'Illuminate\\Support\\Facades\\RateLimiter',
      'Redirect' => 'Illuminate\\Support\\Facades\\Redirect',
      'Request' => 'Illuminate\\Support\\Facades\\Request',
      'Response' => 'Illuminate\\Support\\Facades\\Response',
      'Route' => 'Illuminate\\Support\\Facades\\Route',
      'Schedule' => 'Illuminate\\Support\\Facades\\Schedule',
      'Schema' => 'Illuminate\\Support\\Facades\\Schema',
      'Session' => 'Illuminate\\Support\\Facades\\Session',
      'Storage' => 'Illuminate\\Support\\Facades\\Storage',
      'Str' => 'Illuminate\\Support\\Str',
      'URL' => 'Illuminate\\Support\\Facades\\URL',
      'Uri' => 'Illuminate\\Support\\Uri',
      'Validator' => 'Illuminate\\Support\\Facades\\Validator',
      'View' => 'Illuminate\\Support\\Facades\\View',
      'Vite' => 'Illuminate\\Support\\Facades\\Vite',
    ),
  ),
  'auditcompliance' => 
  array (
    'name' => 'AuditCompliance',
    'audit' => 
    array (
      'enabled' => true,
      'events' => 
      array (
        'created' => true,
        'updated' => true,
        'deleted' => true,
        'restored' => true,
      ),
      'exclude_models' => 
      array (
      ),
      'exclude_attributes' => 
      array (
        0 => 'password',
        1 => 'password_confirmation',
        2 => 'remember_token',
        3 => 'api_token',
        4 => 'two_factor_secret',
        5 => 'two_factor_recovery_codes',
      ),
      'max_attribute_size' => 65535,
      'store_user_agent' => true,
      'store_ip_address' => true,
      'store_url' => true,
      'purge_after_days' => 365,
    ),
    'retention' => 
    array (
      'defaults' => 
      array (
        'audit_logs' => 2555,
        'user_activity' => 1095,
        'session_data' => 90,
        'temporary_files' => 30,
        'gdpr_requests' => 2555,
        'consent_records' => 2555,
      ),
      'periods' => 
      array (
        'financial' => 7,
        'employee' => 5,
        'equipment' => 10,
      ),
      'auto_execute' => false,
      'batch_size' => 1000,
      'max_execution_time' => 3600,
      'use_soft_deletes' => true,
      'soft_delete_grace_period' => 30,
    ),
    'gdpr' => 
    array (
      'default_response_time' => 30,
      'auto_generate_request_id' => true,
      'request_id_format' => 'GDPR-{year}-{sequence}',
      'notify_on_new_request' => true,
      'notify_on_overdue' => true,
      'reminder_days' => 
      array (
        0 => 7,
        1 => 3,
        2 => 1,
      ),
      'request_types' => 
      array (
        'access' => 'Data Access Request',
        'rectification' => 'Data Rectification Request',
        'erasure' => 'Data Erasure Request',
        'portability' => 'Data Portability Request',
        'restriction' => 'Processing Restriction Request',
        'objection' => 'Processing Objection Request',
      ),
      'export_format' => 'json',
      'include_related_data' => true,
      'anonymize_exports' => false,
    ),
    'consent' => 
    array (
      'types' => 
      array (
        'marketing' => 'Marketing Communications',
        'analytics' => 'Analytics and Performance',
        'functional' => 'Functional Cookies',
        'advertising' => 'Advertising and Targeting',
        'data_processing' => 'Data Processing',
      ),
      'default_expiry_days' => 365,
      'require_explicit_consent' => true,
      'enable_versioning' => true,
      'auto_expire' => true,
      'send_renewal_reminders' => true,
      'renewal_reminder_days' => 30,
    ),
    'reporting' => 
    array (
      'types' => 
      array (
        'audit_activity' => 'Audit Activity Report',
        'gdpr_compliance' => 'GDPR Compliance Report',
        'data_retention' => 'Data Retention Report',
        'user_consent' => 'User Consent Report',
        'security_events' => 'Security Events Report',
      ),
      'default_format' => 'pdf',
      'storage_path' => 'compliance-reports',
      'auto_delete_after_days' => 365,
      'include_charts' => true,
      'generation_timeout' => 300,
      'max_records_per_report' => 10000,
    ),
    'compliance' => 
    array (
      'types' => 
      array (
        0 => 'system_access',
        1 => 'data_modification',
        2 => 'financial_transactions',
        3 => 'equipment_usage',
      ),
    ),
    'notifications' => 
    array (
      'email_enabled' => true,
      'database_enabled' => true,
      'slack_enabled' => false,
      'slack_webhook_url' => NULL,
      'default_recipients' => 
      array (
      ),
      'digest_frequency' => 'daily',
      'business_hours_only' => false,
      'business_hours' => 
      array (
        'start' => '09:00',
        'end' => '17:00',
      ),
      'business_days' => 
      array (
        0 => 1,
        1 => 2,
        2 => 3,
        3 => 4,
        4 => 5,
      ),
    ),
    'security' => 
    array (
      'encrypt_sensitive_data' => true,
      'hash_ip_addresses' => false,
      'require_authentication' => true,
      'required_permissions' => 
      array (
        0 => 'view_audit_logs',
        1 => 'manage_compliance',
      ),
      'enable_rate_limiting' => true,
      'rate_limit' => 60,
      'csrf_protection' => true,
      'allowed_file_types' => 
      array (
        0 => 'pdf',
        1 => 'doc',
        2 => 'docx',
        3 => 'txt',
        4 => 'csv',
        5 => 'json',
      ),
      'max_file_size' => 10240,
    ),
    'performance' => 
    array (
      'enable_caching' => true,
      'cache_ttl' => 3600,
      'cache_prefix' => 'audit_compliance',
      'suggest_indexes' => true,
      'queue_jobs' => true,
      'default_queue' => 'compliance',
      'background_processing' => true,
    ),
  ),
  'auth' => 
  array (
    'defaults' => 
    array (
      'guard' => 'web',
      'passwords' => 'users',
    ),
    'guards' => 
    array (
      'web' => 
      array (
        'driver' => 'session',
        'provider' => 'users',
      ),
      'sanctum' => 
      array (
        'driver' => 'sanctum',
        'provider' => NULL,
      ),
    ),
    'providers' => 
    array (
      'users' => 
      array (
        'driver' => 'eloquent',
        'model' => 'Modules\\Core\\Domain\\Models\\User',
      ),
    ),
    'passwords' => 
    array (
      'users' => 
      array (
        'provider' => 'users',
        'table' => 'password_reset_tokens',
        'expire' => 60,
        'throttle' => 60,
      ),
    ),
    'password_timeout' => 10800,
  ),
  'cache' => 
  array (
    'default' => 'database',
    'stores' => 
    array (
      'array' => 
      array (
        'driver' => 'array',
        'serialize' => false,
      ),
      'database' => 
      array (
        'driver' => 'database',
        'connection' => NULL,
        'table' => 'cache',
        'lock_connection' => NULL,
        'lock_table' => NULL,
      ),
      'file' => 
      array (
        'driver' => 'file',
        'path' => 'D:\\Apps\\snd-app\\storage\\framework/cache/data',
        'lock_path' => 'D:\\Apps\\snd-app\\storage\\framework/cache/data',
      ),
      'memcached' => 
      array (
        'driver' => 'memcached',
        'persistent_id' => NULL,
        'sasl' => 
        array (
          0 => NULL,
          1 => NULL,
        ),
        'options' => 
        array (
        ),
        'servers' => 
        array (
          0 => 
          array (
            'host' => '127.0.0.1',
            'port' => 11211,
            'weight' => 100,
          ),
        ),
      ),
      'redis' => 
      array (
        'driver' => 'redis',
        'connection' => 'cache',
        'lock_connection' => 'default',
      ),
      'dynamodb' => 
      array (
        'driver' => 'dynamodb',
        'key' => '',
        'secret' => '',
        'region' => 'us-east-1',
        'table' => 'cache',
        'endpoint' => NULL,
      ),
      'octane' => 
      array (
        'driver' => 'octane',
      ),
    ),
    'prefix' => 'laravel_cache_',
  ),
  'config' => 
  array (
    'name' => 'Payroll',
    'settings' => 
    array (
      'default_currency' => 'SAR',
      'payment_methods' => 
      array (
        0 => 'bank_transfer',
        1 => 'cash',
        2 => 'check',
      ),
      'payment_frequency' => 
      array (
        0 => 'monthly',
        1 => 'bi-weekly',
        2 => 'weekly',
      ),
    ),
    'taxes' => 
    array (
      'enabled' => true,
      'default_tax_rate' => 15,
    ),
    'deductions' => 
    array (
      'types' => 
      array (
        0 => 'tax',
        1 => 'insurance',
        2 => 'loan',
        3 => 'advance',
      ),
    ),
    'cycles' => 
    array (
      'start_day' => 1,
      'end_day' => 'last',
      'processing_day' => 25,
    ),
  ),
  'core' => 
  array (
    'name' => 'Core',
    'description' => 'Core functionality for the SND Rental application',
    'settings' => 
    array (
      'cache' => 
      array (
        'enabled' => true,
        'ttl' => 3600,
      ),
      'logging' => 
      array (
        'enabled' => true,
        'channel' => 'stack',
      ),
    ),
    'dependencies' => 
    array (
    ),
    'events' => 
    array (
      'enabled' => true,
      'listeners' => 
      array (
      ),
    ),
    'middleware' => 
    array (
      'web' => 
      array (
      ),
      'api' => 
      array (
      ),
    ),
    'routes' => 
    array (
      'prefix' => 'core',
      'middleware' => 
      array (
        0 => 'web',
      ),
    ),
    'views' => 
    array (
      'namespace' => 'core',
      'path' => 'resources/views/modules/core',
    ),
    'translations' => 
    array (
      'namespace' => 'core',
      'path' => 'resources/lang/modules/core',
    ),
    'providers' => 
    array (
      0 => 'Modules\\Core\\Providers\\CoreServiceProvider',
      1 => 'Modules\\Core\\Providers\\RouteServiceProvider',
      2 => 'Modules\\Core\\Providers\\EventServiceProvider',
      3 => 'Modules\\Core\\Providers\\ToastServiceProvider',
    ),
    'images' => 
    array (
      'optimize' => true,
      'quality' => 80,
      'max_width' => 1920,
      'max_height' => 1080,
      'formats' => 
      array (
        0 => 'jpg',
        1 => 'jpeg',
        2 => 'png',
        3 => 'webp',
      ),
    ),
  ),
  'cors' => 
  array (
    'paths' => 
    array (
      0 => 'api/*',
      1 => 'sanctum/csrf-cookie',
    ),
    'allowed_methods' => 
    array (
      0 => '*',
    ),
    'allowed_origins' => 
    array (
    ),
    'allowed_origins_patterns' => 
    array (
      0 => '/^https?:\\/\\/.+/',
    ),
    'allowed_headers' => 
    array (
      0 => '*',
    ),
    'exposed_headers' => 
    array (
    ),
    'max_age' => 0,
    'supports_credentials' => true,
  ),
  'customermanagement' => 
  array (
    'name' => 'CustomerManagement',
    'default_payment_terms' => 30,
    'payment_terms_options' => 
    array (
      0 => 0,
      1 => 15,
      2 => 30,
      3 => 45,
      4 => 60,
    ),
    'default_credit_limit' => 5000,
    'document_max_size' => 10240,
    'allowed_document_types' => 
    array (
      0 => 'pdf',
      1 => 'doc',
      2 => 'docx',
      3 => 'jpg',
      4 => 'jpeg',
      5 => 'png',
    ),
  ),
  'database' => 
  array (
    'default' => 'pgsql',
    'connections' => 
    array (
      'sqlite' => 
      array (
        'driver' => 'sqlite',
        'url' => NULL,
        'database' => 'snd_app_db',
        'prefix' => '',
        'foreign_key_constraints' => true,
        'busy_timeout' => NULL,
        'journal_mode' => NULL,
        'synchronous' => NULL,
      ),
      'mysql' => 
      array (
        'driver' => 'mysql',
        'url' => NULL,
        'host' => '192.168.8.208',
        'port' => '5432',
        'database' => 'snd_app_db',
        'username' => 'ias',
        'password' => '46726254',
        'unix_socket' => '',
        'charset' => 'utf8mb4',
        'collation' => 'utf8mb4_unicode_ci',
        'prefix' => '',
        'prefix_indexes' => true,
        'strict' => true,
        'engine' => 'InnoDB',
        'options' => 
        array (
        ),
      ),
      'mariadb' => 
      array (
        'driver' => 'mariadb',
        'url' => NULL,
        'host' => '192.168.8.208',
        'port' => '5432',
        'database' => 'snd_app_db',
        'username' => 'ias',
        'password' => '46726254',
        'unix_socket' => '',
        'charset' => 'utf8mb4',
        'collation' => 'utf8mb4_unicode_ci',
        'prefix' => '',
        'prefix_indexes' => true,
        'strict' => true,
        'engine' => NULL,
        'options' => 
        array (
        ),
      ),
      'pgsql' => 
      array (
        'driver' => 'pgsql',
        'url' => NULL,
        'host' => '192.168.8.208',
        'port' => '5432',
        'database' => 'snd_app_db',
        'username' => 'ias',
        'password' => '46726254',
        'charset' => 'utf8',
        'prefix' => '',
        'prefix_indexes' => true,
        'search_path' => 'public',
        'sslmode' => 'prefer',
      ),
      'sqlsrv' => 
      array (
        'driver' => 'sqlsrv',
        'url' => NULL,
        'host' => '192.168.8.208',
        'port' => '5432',
        'database' => 'snd_app_db',
        'username' => 'ias',
        'password' => '46726254',
        'charset' => 'utf8',
        'prefix' => '',
        'prefix_indexes' => true,
      ),
    ),
    'migrations' => 
    array (
      'table' => 'migrations',
      'update_date_on_publish' => true,
    ),
    'redis' => 
    array (
      'client' => 'phpredis',
      'options' => 
      array (
        'cluster' => 'redis',
        'prefix' => 'laravel_database_',
        'persistent' => false,
      ),
      'default' => 
      array (
        'url' => NULL,
        'host' => '127.0.0.1',
        'username' => NULL,
        'password' => NULL,
        'port' => '6379',
        'database' => '0',
      ),
      'cache' => 
      array (
        'url' => NULL,
        'host' => '127.0.0.1',
        'username' => NULL,
        'password' => NULL,
        'port' => '6379',
        'database' => '1',
      ),
    ),
  ),
  'dompdf' => 
  array (
    'show_warnings' => false,
    'public_path' => NULL,
    'convert_entities' => true,
    'options' => 
    array (
      'font_dir' => 'D:\\Apps\\snd-app\\storage\\fonts',
      'font_cache' => 'D:\\Apps\\snd-app\\storage\\fonts',
      'temp_dir' => 'C:\\Users\\IAS\\AppData\\Local\\Temp',
      'chroot' => 'D:\\Apps\\snd-app',
      'allowed_protocols' => 
      array (
        'data://' => 
        array (
          'rules' => 
          array (
          ),
        ),
        'file://' => 
        array (
          'rules' => 
          array (
          ),
        ),
        'http://' => 
        array (
          'rules' => 
          array (
          ),
        ),
        'https://' => 
        array (
          'rules' => 
          array (
          ),
        ),
      ),
      'artifactPathValidation' => NULL,
      'log_output_file' => NULL,
      'enable_font_subsetting' => false,
      'pdf_backend' => 'CPDF',
      'default_media_type' => 'screen',
      'default_paper_size' => 'a4',
      'default_paper_orientation' => 'portrait',
      'default_font' => 'serif',
      'dpi' => 96,
      'enable_php' => false,
      'enable_javascript' => true,
      'enable_remote' => false,
      'allowed_remote_hosts' => NULL,
      'font_height_ratio' => 1.1,
      'enable_html5_parser' => true,
    ),
  ),
  'equipmentmanagement' => 
  array (
    'name' => 'EquipmentManagement',
    'equipment' => 
    array (
      'statuses' => 
      array (
        0 => 'available',
        1 => 'in_use',
        2 => 'under_maintenance',
        3 => 'out_of_service',
        4 => 'retired',
      ),
      'types' => 
      array (
        0 => 'heavy_equipment',
        1 => 'light_equipment',
        2 => 'tools',
        3 => 'vehicles',
        4 => 'electronics',
      ),
    ),
    'maintenance' => 
    array (
      'types' => 
      array (
        0 => 'routine',
        1 => 'preventive',
        2 => 'corrective',
        3 => 'emergency',
      ),
      'schedule_reminder_days' => 7,
    ),
    'depreciation' => 
    array (
      'methods' => 
      array (
        0 => 'straight_line',
        1 => 'declining_balance',
        2 => 'sum_of_years_digits',
      ),
      'default_method' => 'straight_line',
    ),
  ),
  'filesystems' => 
  array (
    'default' => 'local',
    'disks' => 
    array (
      'local' => 
      array (
        'driver' => 'local',
        'root' => 'D:\\Apps\\snd-app\\storage\\app/private',
        'serve' => true,
        'throw' => false,
        'report' => false,
      ),
      'public' => 
      array (
        'driver' => 'local',
        'root' => 'D:\\Apps\\snd-app\\storage\\app/public',
        'url' => 'https://snd-app.test/storage',
        'visibility' => 'public',
        'throw' => false,
        'report' => false,
      ),
      's3' => 
      array (
        'driver' => 's3',
        'key' => '',
        'secret' => '',
        'region' => 'us-east-1',
        'bucket' => '',
        'url' => NULL,
        'endpoint' => NULL,
        'use_path_style_endpoint' => false,
        'throw' => false,
        'report' => false,
      ),
      'backups' => 
      array (
        'driver' => 'local',
        'root' => 'D:\\Apps\\snd-app\\storage\\app/backups',
      ),
    ),
    'links' => 
    array (
      'D:\\Apps\\snd-app\\public\\storage' => 'D:\\Apps\\snd-app\\storage\\app/public',
      'D:\\Apps\\snd-app\\public\\locales' => 'D:\\Apps\\snd-app\\Modules/Core/resources/lang',
    ),
  ),
  'inertia' => 
  array (
    'ssr' => 
    array (
      'enabled' => true,
      'url' => 'http://127.0.0.1:13714',
    ),
    'testing' => 
    array (
      'ensure_pages_exist' => true,
      'page_paths' => 
      array (
        0 => 'D:\\Apps\\snd-app\\resources\\js/pages',
      ),
      'page_extensions' => 
      array (
        0 => 'js',
        1 => 'jsx',
        2 => 'svelte',
        3 => 'ts',
        4 => 'tsx',
        5 => 'vue',
      ),
    ),
    'history' => 
    array (
      'encrypt' => false,
    ),
  ),
  'laravolt' => 
  array (
    'avatar' => 
    array (
      'driver' => 'gd',
      'cache' => 
      array (
        'enabled' => true,
        'key_prefix' => 'avatar_',
        'duration' => 86400,
      ),
      'generator' => 'Laravolt\\Avatar\\Generator\\DefaultGenerator',
      'ascii' => false,
      'shape' => 'circle',
      'width' => 100,
      'height' => 100,
      'responsive' => false,
      'chars' => 2,
      'fontSize' => 48,
      'uppercase' => false,
      'rtl' => false,
      'fonts' => 
      array (
        0 => 'D:\\Apps\\snd-app\\config\\laravolt/../fonts/OpenSans-Bold.ttf',
        1 => 'D:\\Apps\\snd-app\\config\\laravolt/../fonts/rockwell.ttf',
      ),
      'foregrounds' => 
      array (
        0 => '#FFFFFF',
      ),
      'backgrounds' => 
      array (
        0 => '#FF6B6B',
        1 => '#4ECDC4',
        2 => '#45B7D1',
        3 => '#96CEB4',
        4 => '#FFEAA7',
        5 => '#DDA0DD',
        6 => '#98D8C8',
        7 => '#F7DC6F',
        8 => '#BB8FCE',
        9 => '#85C1E9',
        10 => '#F8C471',
        11 => '#82E0AA',
        12 => '#F1948A',
        13 => '#85C1E9',
        14 => '#D2B4DE',
      ),
      'border' => 
      array (
        'size' => 0,
        'color' => 'background',
        'radius' => 0,
      ),
      'theme' => 'colorful',
      'themes' => 
      array (
        'grayscale-light' => 
        array (
          'backgrounds' => 
          array (
            0 => '#edf2f7',
            1 => '#e2e8f0',
            2 => '#cbd5e0',
          ),
          'foregrounds' => 
          array (
            0 => '#a0aec0',
          ),
        ),
        'grayscale-dark' => 
        array (
          'backgrounds' => 
          array (
            0 => '#2d3748',
            1 => '#4a5568',
            2 => '#718096',
          ),
          'foregrounds' => 
          array (
            0 => '#e2e8f0',
          ),
        ),
        'colorful' => 
        array (
          'backgrounds' => 
          array (
            0 => '#f44336',
            1 => '#E91E63',
            2 => '#9C27B0',
            3 => '#673AB7',
            4 => '#3F51B5',
            5 => '#2196F3',
            6 => '#03A9F4',
            7 => '#00BCD4',
            8 => '#009688',
            9 => '#4CAF50',
            10 => '#8BC34A',
            11 => '#CDDC39',
            12 => '#FFC107',
            13 => '#FF9800',
            14 => '#FF5722',
          ),
          'foregrounds' => 
          array (
            0 => '#FFFFFF',
          ),
        ),
        'pastel' => 
        array (
          'backgrounds' => 
          array (
            0 => '#ef9a9a',
            1 => '#F48FB1',
            2 => '#CE93D8',
            3 => '#B39DDB',
            4 => '#9FA8DA',
            5 => '#90CAF9',
            6 => '#81D4FA',
            7 => '#80DEEA',
            8 => '#80CBC4',
            9 => '#A5D6A7',
            10 => '#E6EE9C',
            11 => '#FFAB91',
            12 => '#FFCCBC',
            13 => '#D7CCC8',
          ),
          'foregrounds' => 
          array (
            0 => '#FFF',
          ),
        ),
      ),
      'fontFamily' => NULL,
    ),
  ),
  'leavemanagement' => 
  array (
    'name' => 'LeaveManagement',
    'leave_types' => 
    array (
      'annual' => 20,
      'sick' => 10,
      'maternity' => 90,
      'paternity' => 10,
      'compassionate' => 5,
      'unpaid' => 0,
    ),
    'advance_request_days' => 7,
    'min_days_for_advance_approval' => 3,
    'allow_half_day' => true,
    'allow_carry_forward' => true,
    'max_carry_forward' => 10,
    'allow_encashment' => true,
    'max_encashment' => 5,
  ),
  'localization' => 
  array (
    'name' => 'Localization',
    'languages' => 
    array (
      'default' => 'en',
      'available' => 
      array (
        'en' => 'English',
        'ar' => 'Arabic',
        'hi' => 'Hindi',
        'bn' => 'Bengali',
        'ur' => 'Urdu',
      ),
    ),
    'currencies' => 
    array (
      'default' => 'SAR',
      'available' => 
      array (
        'SAR' => 
        array (
          'name' => 'Saudi Riyal',
          'symbol' => 'ر.س',
        ),
      ),
    ),
    'date_formats' => 
    array (
      'default' => 'Y-m-d',
      'available' => 
      array (
        'Y-m-d' => 'YYYY-MM-DD',
        'd/m/Y' => 'DD/MM/YYYY',
        'm/d/Y' => 'MM/DD/YYYY',
      ),
    ),
    'time_formats' => 
    array (
      'default' => 'H:i',
      'available' => 
      array (
        'H:i' => '24 Hour (e.g. 14:30)',
        'h:i A' => '12 Hour (e.g. 02:30 PM)',
      ),
    ),
  ),
  'logging' => 
  array (
    'default' => 'stack',
    'deprecations' => 
    array (
      'channel' => NULL,
      'trace' => false,
    ),
    'channels' => 
    array (
      'stack' => 
      array (
        'driver' => 'stack',
        'channels' => 
        array (
          0 => 'single',
        ),
        'ignore_exceptions' => false,
      ),
      'single' => 
      array (
        'driver' => 'single',
        'path' => 'D:\\Apps\\snd-app\\storage\\logs/laravel.log',
        'level' => 'debug',
        'replace_placeholders' => true,
      ),
      'daily' => 
      array (
        'driver' => 'daily',
        'path' => 'D:\\Apps\\snd-app\\storage\\logs/laravel.log',
        'level' => 'debug',
        'days' => 14,
        'replace_placeholders' => true,
      ),
      'slack' => 
      array (
        'driver' => 'slack',
        'url' => NULL,
        'username' => 'Laravel Log',
        'emoji' => ':boom:',
        'level' => 'debug',
        'replace_placeholders' => true,
      ),
      'papertrail' => 
      array (
        'driver' => 'monolog',
        'level' => 'debug',
        'handler' => 'Monolog\\Handler\\SyslogUdpHandler',
        'handler_with' => 
        array (
          'host' => NULL,
          'port' => NULL,
          'connectionString' => 'tls://:',
        ),
        'processors' => 
        array (
          0 => 'Monolog\\Processor\\PsrLogMessageProcessor',
        ),
      ),
      'stderr' => 
      array (
        'driver' => 'monolog',
        'level' => 'debug',
        'handler' => 'Monolog\\Handler\\StreamHandler',
        'formatter' => NULL,
        'with' => 
        array (
          'stream' => 'php://stderr',
        ),
        'processors' => 
        array (
          0 => 'Monolog\\Processor\\PsrLogMessageProcessor',
        ),
      ),
      'syslog' => 
      array (
        'driver' => 'syslog',
        'level' => 'debug',
        'facility' => 8,
        'replace_placeholders' => true,
      ),
      'errorlog' => 
      array (
        'driver' => 'errorlog',
        'level' => 'debug',
        'replace_placeholders' => true,
      ),
      'null' => 
      array (
        'driver' => 'monolog',
        'handler' => 'Monolog\\Handler\\NullHandler',
      ),
      'emergency' => 
      array (
        'path' => 'D:\\Apps\\snd-app\\storage\\logs/laravel.log',
      ),
    ),
  ),
  'mail' => 
  array (
    'default' => 'log',
    'mailers' => 
    array (
      'smtp' => 
      array (
        'transport' => 'smtp',
        'scheme' => NULL,
        'url' => NULL,
        'host' => '127.0.0.1',
        'port' => '2525',
        'username' => NULL,
        'password' => NULL,
        'timeout' => NULL,
        'local_domain' => 'snd-app.test',
      ),
      'ses' => 
      array (
        'transport' => 'ses',
      ),
      'postmark' => 
      array (
        'transport' => 'postmark',
      ),
      'resend' => 
      array (
        'transport' => 'resend',
      ),
      'sendmail' => 
      array (
        'transport' => 'sendmail',
        'path' => '/usr/sbin/sendmail -bs -i',
      ),
      'log' => 
      array (
        'transport' => 'log',
        'channel' => NULL,
      ),
      'array' => 
      array (
        'transport' => 'array',
      ),
      'failover' => 
      array (
        'transport' => 'failover',
        'mailers' => 
        array (
          0 => 'smtp',
          1 => 'log',
        ),
      ),
      'roundrobin' => 
      array (
        'transport' => 'roundrobin',
        'mailers' => 
        array (
          0 => 'ses',
          1 => 'postmark',
        ),
      ),
    ),
    'from' => 
    array (
      'address' => 'hello@example.com',
      'name' => 'Laravel',
    ),
    'markdown' => 
    array (
      'theme' => 'default',
      'paths' => 
      array (
        0 => 'D:\\Apps\\snd-app\\resources\\views/vendor/mail',
      ),
    ),
  ),
  'media-library' => 
  array (
    'disk_name' => 'public',
    'max_file_size' => 10485760,
    'queue_connection_name' => 'database',
    'queue_name' => '',
    'queue_conversions_by_default' => true,
    'queue_conversions_after_database_commit' => true,
    'media_model' => 'Spatie\\MediaLibrary\\MediaCollections\\Models\\Media',
    'media_observer' => 'Spatie\\MediaLibrary\\MediaCollections\\Models\\Observers\\MediaObserver',
    'use_default_collection_serialization' => false,
    'temporary_upload_model' => 'Spatie\\MediaLibraryPro\\Models\\TemporaryUpload',
    'enable_temporary_uploads_session_affinity' => true,
    'generate_thumbnails_for_temporary_uploads' => true,
    'file_namer' => 'Spatie\\MediaLibrary\\Support\\FileNamer\\DefaultFileNamer',
    'path_generator' => 'Spatie\\MediaLibrary\\Support\\PathGenerator\\DefaultPathGenerator',
    'file_remover_class' => 'Spatie\\MediaLibrary\\Support\\FileRemover\\DefaultFileRemover',
    'custom_path_generators' => 
    array (
    ),
    'url_generator' => 'Spatie\\MediaLibrary\\Support\\UrlGenerator\\DefaultUrlGenerator',
    'moves_media_on_update' => false,
    'version_urls' => false,
    'image_optimizers' => 
    array (
      'Spatie\\ImageOptimizer\\Optimizers\\Jpegoptim' => 
      array (
        0 => '-m85',
        1 => '--force',
        2 => '--strip-all',
        3 => '--all-progressive',
      ),
      'Spatie\\ImageOptimizer\\Optimizers\\Pngquant' => 
      array (
        0 => '--force',
      ),
      'Spatie\\ImageOptimizer\\Optimizers\\Optipng' => 
      array (
        0 => '-i0',
        1 => '-o2',
        2 => '-quiet',
      ),
      'Spatie\\ImageOptimizer\\Optimizers\\Svgo' => 
      array (
        0 => '--disable=cleanupIDs',
      ),
      'Spatie\\ImageOptimizer\\Optimizers\\Gifsicle' => 
      array (
        0 => '-b',
        1 => '-O3',
      ),
      'Spatie\\ImageOptimizer\\Optimizers\\Cwebp' => 
      array (
        0 => '-m 6',
        1 => '-pass 10',
        2 => '-mt',
        3 => '-q 90',
      ),
      'Spatie\\ImageOptimizer\\Optimizers\\Avifenc' => 
      array (
        0 => '-a cq-level=23',
        1 => '-j all',
        2 => '--min 0',
        3 => '--max 63',
        4 => '--minalpha 0',
        5 => '--maxalpha 63',
        6 => '-a end-usage=q',
        7 => '-a tune=ssim',
      ),
    ),
    'image_generators' => 
    array (
      0 => 'Spatie\\MediaLibrary\\Conversions\\ImageGenerators\\Image',
      1 => 'Spatie\\MediaLibrary\\Conversions\\ImageGenerators\\Webp',
      2 => 'Spatie\\MediaLibrary\\Conversions\\ImageGenerators\\Avif',
      3 => 'Spatie\\MediaLibrary\\Conversions\\ImageGenerators\\Pdf',
      4 => 'Spatie\\MediaLibrary\\Conversions\\ImageGenerators\\Svg',
      5 => 'Spatie\\MediaLibrary\\Conversions\\ImageGenerators\\Video',
    ),
    'temporary_directory_path' => NULL,
    'image_driver' => 'gd',
    'ffmpeg_path' => '/usr/bin/ffmpeg',
    'ffprobe_path' => '/usr/bin/ffprobe',
    'jobs' => 
    array (
      'perform_conversions' => 'Spatie\\MediaLibrary\\Conversions\\Jobs\\PerformConversionsJob',
      'generate_responsive_images' => 'Spatie\\MediaLibrary\\ResponsiveImages\\Jobs\\GenerateResponsiveImagesJob',
    ),
    'media_downloader' => 'Spatie\\MediaLibrary\\Downloaders\\DefaultDownloader',
    'media_downloader_ssl' => true,
    'remote' => 
    array (
      'extra_headers' => 
      array (
        'CacheControl' => 'max-age=604800',
      ),
    ),
    'responsive_images' => 
    array (
      'width_calculator' => 'Spatie\\MediaLibrary\\ResponsiveImages\\WidthCalculator\\FileSizeOptimizedWidthCalculator',
      'use_tiny_placeholders' => true,
      'tiny_placeholder_generator' => 'Spatie\\MediaLibrary\\ResponsiveImages\\TinyPlaceholderGenerator\\Blurred',
    ),
    'enable_vapor_uploads' => false,
    'default_loading_attribute_value' => NULL,
    'prefix' => '',
    'force_lazy_loading' => true,
  ),
  'mobile_geofencing' => 
  array (
    'gps' => 
    array (
      'min_accuracy' => 50,
      'max_accuracy' => 500,
      'update_interval' => 30,
      'max_location_age' => 300,
      'high_accuracy' => true,
      'timeout' => 15,
      'history_limit' => 100,
      'min_distance_filter' => 10,
    ),
    'zones' => 
    array (
      'default_radius' => 100,
      'min_radius' => 10,
      'max_radius' => 5000,
      'buffer_zone' => 20,
      'max_polygon_points' => 50,
      'types' => 
      array (
        'project_site' => 
        array (
          'name' => 'Project Site',
          'color' => '#3B82F6',
          'icon' => 'building',
          'strict_enforcement' => true,
          'priority' => 1,
        ),
        'office' => 
        array (
          'name' => 'Office',
          'color' => '#10B981',
          'icon' => 'building-2',
          'strict_enforcement' => false,
          'priority' => 2,
        ),
        'warehouse' => 
        array (
          'name' => 'Warehouse',
          'color' => '#F59E0B',
          'icon' => 'warehouse',
          'strict_enforcement' => true,
          'priority' => 3,
        ),
        'restricted' => 
        array (
          'name' => 'Restricted Area',
          'color' => '#EF4444',
          'icon' => 'shield-alert',
          'strict_enforcement' => true,
          'priority' => 0,
        ),
        'custom' => 
        array (
          'name' => 'Custom Zone',
          'color' => '#8B5CF6',
          'icon' => 'map-pin',
          'strict_enforcement' => false,
          'priority' => 4,
        ),
      ),
    ),
    'violations' => 
    array (
      'enabled' => true,
      'sensitivity' => 'medium',
      'min_violation_duration' => 60,
      'max_daily_violations' => 5,
      'types' => 
      array (
        'outside_zone' => 
        array (
          'name' => 'Outside Authorized Zone',
          'default_severity' => 'medium',
          'auto_escalate' => true,
          'escalation_threshold' => 3,
        ),
        'unauthorized_zone' => 
        array (
          'name' => 'In Unauthorized Zone',
          'default_severity' => 'high',
          'auto_escalate' => true,
          'escalation_threshold' => 1,
        ),
        'time_restriction' => 
        array (
          'name' => 'Time Restriction Violation',
          'default_severity' => 'medium',
          'auto_escalate' => false,
          'escalation_threshold' => 5,
        ),
        'accuracy_low' => 
        array (
          'name' => 'Low GPS Accuracy',
          'default_severity' => 'low',
          'auto_escalate' => false,
          'escalation_threshold' => 10,
        ),
        'suspicious_location' => 
        array (
          'name' => 'Suspicious Location Pattern',
          'default_severity' => 'high',
          'auto_escalate' => true,
          'escalation_threshold' => 2,
        ),
      ),
      'severity_levels' => 
      array (
        'low' => 
        array (
          'name' => 'Low',
          'color' => '#3B82F6',
          'distance_threshold' => 50,
          'duration_threshold' => 300,
          'auto_notify' => false,
        ),
        'medium' => 
        array (
          'name' => 'Medium',
          'color' => '#F59E0B',
          'distance_threshold' => 100,
          'duration_threshold' => 180,
          'auto_notify' => true,
        ),
        'high' => 
        array (
          'name' => 'High',
          'color' => '#EF4444',
          'distance_threshold' => 200,
          'duration_threshold' => 60,
          'auto_notify' => true,
        ),
        'critical' => 
        array (
          'name' => 'Critical',
          'color' => '#DC2626',
          'distance_threshold' => 500,
          'duration_threshold' => 30,
          'auto_notify' => true,
        ),
      ),
    ),
    'notifications' => 
    array (
      'enabled' => true,
      'channels' => 
      array (
        'mail' => true,
        'database' => true,
        'broadcast' => true,
        'sms' => false,
        'push' => true,
      ),
      'recipients' => 
      array (
        'employee' => 
        array (
          'enabled' => true,
          'channels' => 
          array (
            0 => 'database',
            1 => 'push',
          ),
          'severity_threshold' => 'medium',
        ),
        'project_manager' => 
        array (
          'enabled' => true,
          'channels' => 
          array (
            0 => 'mail',
            1 => 'database',
          ),
          'severity_threshold' => 'medium',
        ),
        'hr_manager' => 
        array (
          'enabled' => true,
          'channels' => 
          array (
            0 => 'mail',
            1 => 'database',
          ),
          'severity_threshold' => 'high',
        ),
        'system_admin' => 
        array (
          'enabled' => true,
          'channels' => 
          array (
            0 => 'mail',
            1 => 'database',
            2 => 'sms',
          ),
          'severity_threshold' => 'critical',
        ),
      ),
      'throttling' => 
      array (
        'enabled' => true,
        'max_per_hour' => 10,
        'max_per_day' => 50,
        'cooldown_period' => 300,
      ),
      'templates' => 
      array (
        'violation_detected' => 'timesheet::emails.geofence_violation',
        'violation_resolved' => 'timesheet::emails.geofence_resolved',
        'daily_summary' => 'timesheet::emails.geofence_daily_summary',
      ),
    ),
    'mobile' => 
    array (
      'offline_mode' => true,
      'max_offline_entries' => 100,
      'auto_sync_interval' => 300,
      'background_tracking' => true,
      'battery_optimization' => 
      array (
        'enabled' => true,
        'low_battery_threshold' => 20,
        'reduce_accuracy_on_low_battery' => true,
        'increase_update_interval_on_low_battery' => true,
      ),
      'min_app_version' => '1.0.0',
      'supported_platforms' => 
      array (
        0 => 'ios',
        1 => 'android',
        2 => 'web',
      ),
      'device_requirements' => 
      array (
        'gps_required' => true,
        'network_required' => false,
        'camera_required' => false,
        'min_storage_mb' => 50,
      ),
    ),
    'security' => 
    array (
      'location_verification' => true,
      'anti_spoofing' => 
      array (
        'enabled' => true,
        'check_mock_locations' => true,
        'check_developer_options' => true,
        'check_root_jailbreak' => true,
        'verify_location_consistency' => true,
      ),
      'device_fingerprinting' => 
      array (
        'enabled' => true,
        'track_device_changes' => true,
        'max_devices_per_user' => 3,
        'device_registration_required' => false,
      ),
      'encryption' => 
      array (
        'encrypt_location_data' => true,
        'encrypt_offline_data' => true,
        'encryption_algorithm' => 'AES-256-CBC',
      ),
      'audit_logging' => 
      array (
        'enabled' => true,
        'log_location_updates' => false,
        'log_violations' => true,
        'log_admin_actions' => true,
        'retention_days' => 90,
      ),
    ),
    'performance' => 
    array (
      'cache' => 
      array (
        'enabled' => true,
        'ttl' => 3600,
        'store' => 'redis',
      ),
      'database' => 
      array (
        'batch_insert_size' => 100,
        'cleanup_old_data' => true,
        'cleanup_interval_days' => 90,
        'index_optimization' => true,
      ),
      'rate_limiting' => 
      array (
        'enabled' => true,
        'requests_per_minute' => 60,
        'burst_limit' => 10,
      ),
      'jobs' => 
      array (
        'queue' => 'default',
        'max_retries' => 3,
        'retry_delay' => 60,
        'timeout' => 300,
      ),
    ),
    'integrations' => 
    array (
      'google_maps' => 
      array (
        'enabled' => false,
        'api_key' => NULL,
        'geocoding' => true,
        'reverse_geocoding' => true,
      ),
      'openstreetmap' => 
      array (
        'enabled' => true,
        'nominatim_url' => 'https://nominatim.openstreetmap.org',
        'user_agent' => 'TimesheetApp/1.0',
      ),
      'external_services' => 
      array (
        'enabled' => false,
        'primary_service' => NULL,
        'fallback_service' => NULL,
      ),
      'webhooks' => 
      array (
        'enabled' => false,
        'endpoints' => 
        array (
        ),
        'timeout' => 30,
        'retries' => 3,
      ),
    ),
    'compliance' => 
    array (
      'gdpr' => 
      array (
        'enabled' => true,
        'consent_required' => true,
        'data_retention_days' => 365,
        'right_to_deletion' => true,
        'data_portability' => true,
      ),
      'privacy' => 
      array (
        'anonymize_location_data' => false,
        'blur_home_locations' => true,
        'home_location_radius' => 200,
        'allow_location_sharing' => false,
      ),
      'legal' => 
      array (
        'employee_consent_required' => true,
        'union_notification_required' => false,
        'local_law_compliance' => true,
        'data_processing_agreement' => true,
      ),
    ),
    'reporting' => 
    array (
      'enabled' => true,
      'types' => 
      array (
        'daily_summary' => true,
        'weekly_summary' => true,
        'monthly_summary' => true,
        'violation_report' => true,
        'compliance_report' => true,
        'performance_report' => true,
      ),
      'automated' => 
      array (
        'enabled' => true,
        'daily_summary_time' => '08:00',
        'weekly_summary_day' => 'monday',
        'monthly_summary_day' => 1,
        'recipients' => 
        array (
          0 => 'hr@company.com',
          1 => 'admin@company.com',
        ),
      ),
      'export' => 
      array (
        'formats' => 
        array (
          0 => 'csv',
          1 => 'excel',
          2 => 'pdf',
        ),
        'max_records' => 10000,
        'include_personal_data' => false,
      ),
    ),
    'development' => 
    array (
      'debug' => false,
      'mock_location' => 
      array (
        'enabled' => false,
        'latitude' => 40.7128,
        'longitude' => -74.006,
        'accuracy' => 10,
      ),
      'testing' => 
      array (
        'simulate_violations' => false,
        'bypass_security_checks' => false,
        'log_all_events' => false,
      ),
      'tools' => 
      array (
        'location_simulator' => false,
        'violation_generator' => false,
        'performance_profiler' => false,
      ),
    ),
  ),
  'mobilebridge' => 
  array (
    'name' => 'MobileBridge',
    'api' => 
    array (
      'version' => 'v1',
      'prefix' => 'api/mobile',
      'throttle' => 
      array (
        'enabled' => true,
        'max_attempts' => 60,
        'decay_minutes' => 1,
      ),
    ),
    'auth' => 
    array (
      'token_expiration' => 10080,
      'refresh_token_expiration' => 43200,
    ),
    'push_notifications' => 
    array (
      'enabled' => true,
      'service' => 'firebase',
      'firebase' => 
      array (
        'server_key' => NULL,
      ),
      'vapid' => 
      array (
        'subject' => 'mailto:admin@example.com',
        'public_key' => NULL,
        'private_key' => NULL,
      ),
    ),
    'offline' => 
    array (
      'enabled' => true,
      'sync_interval' => 15,
      'max_queue_size' => 100,
    ),
    'responsive' => 
    array (
      'breakpoints' => 
      array (
        'mobile' => 480,
        'tablet' => 768,
        'desktop' => 1024,
      ),
      'default_layout' => 'mobile',
      'layouts' => 
      array (
        'mobile' => 'layouts.mobile',
        'tablet' => 'layouts.tablet',
        'desktop' => 'layouts.desktop',
      ),
    ),
    'pwa' => 
    array (
      'enabled' => true,
      'manifest' => 
      array (
        'name' => 'SND Management App',
        'short_name' => 'SND App',
        'start_url' => '/',
        'display' => 'standalone',
        'background_color' => '#ffffff',
        'theme_color' => '#4A90E2',
      ),
    ),
  ),
  'modules' => 
  array (
    'namespace' => 'Modules',
    'stubs' => 
    array (
      'enabled' => false,
      'path' => 'D:\\Apps\\snd-app\\vendor/nwidart/laravel-modules/src/Commands/stubs',
      'files' => 
      array (
        'routes/web' => 'routes/web.php',
        'routes/api' => 'routes/api.php',
        'views/index' => 'resources/views/index.blade.php',
        'views/master' => 'resources/views/components/layouts/master.blade.php',
        'scaffold/config' => 'config/config.php',
        'composer' => 'composer.json',
        'assets/js/app' => 'resources/assets/js/app.js',
        'assets/sass/app' => 'resources/assets/sass/app.scss',
        'vite' => 'vite.config.js',
        'package' => 'package.json',
      ),
      'replacements' => 
      array (
        'routes/web' => 
        array (
          0 => 'LOWER_NAME',
          1 => 'STUDLY_NAME',
          2 => 'PLURAL_LOWER_NAME',
          3 => 'KEBAB_NAME',
          4 => 'MODULE_NAMESPACE',
          5 => 'CONTROLLER_NAMESPACE',
        ),
        'routes/api' => 
        array (
          0 => 'LOWER_NAME',
          1 => 'STUDLY_NAME',
          2 => 'PLURAL_LOWER_NAME',
          3 => 'KEBAB_NAME',
          4 => 'MODULE_NAMESPACE',
          5 => 'CONTROLLER_NAMESPACE',
        ),
        'vite' => 
        array (
          0 => 'LOWER_NAME',
          1 => 'STUDLY_NAME',
          2 => 'KEBAB_NAME',
        ),
        'json' => 
        array (
          0 => 'LOWER_NAME',
          1 => 'STUDLY_NAME',
          2 => 'KEBAB_NAME',
          3 => 'MODULE_NAMESPACE',
          4 => 'PROVIDER_NAMESPACE',
        ),
        'views/index' => 
        array (
          0 => 'LOWER_NAME',
        ),
        'views/master' => 
        array (
          0 => 'LOWER_NAME',
          1 => 'STUDLY_NAME',
          2 => 'KEBAB_NAME',
        ),
        'scaffold/config' => 
        array (
          0 => 'STUDLY_NAME',
        ),
        'composer' => 
        array (
          0 => 'LOWER_NAME',
          1 => 'STUDLY_NAME',
          2 => 'VENDOR',
          3 => 'AUTHOR_NAME',
          4 => 'AUTHOR_EMAIL',
          5 => 'MODULE_NAMESPACE',
          6 => 'PROVIDER_NAMESPACE',
          7 => 'APP_FOLDER_NAME',
        ),
      ),
      'gitkeep' => true,
    ),
    'paths' => 
    array (
      'modules' => 'D:\\Apps\\snd-app\\Modules',
      'assets' => 'D:\\Apps\\snd-app\\public\\modules',
      'migration' => 'D:\\Apps\\snd-app\\database/migrations',
      'app_folder' => 'app/',
      'generator' => 
      array (
        'actions' => 
        array (
          'path' => 'app/Actions',
          'generate' => false,
        ),
        'casts' => 
        array (
          'path' => 'app/Casts',
          'generate' => false,
        ),
        'channels' => 
        array (
          'path' => 'app/Broadcasting',
          'generate' => false,
        ),
        'class' => 
        array (
          'path' => 'app/Classes',
          'generate' => false,
        ),
        'command' => 
        array (
          'path' => 'app/Console',
          'generate' => false,
        ),
        'component-class' => 
        array (
          'path' => 'app/View/Components',
          'generate' => false,
        ),
        'emails' => 
        array (
          'path' => 'app/Emails',
          'generate' => false,
        ),
        'event' => 
        array (
          'path' => 'app/Events',
          'generate' => false,
        ),
        'enums' => 
        array (
          'path' => 'app/Enums',
          'generate' => false,
        ),
        'exceptions' => 
        array (
          'path' => 'app/Exceptions',
          'generate' => false,
        ),
        'jobs' => 
        array (
          'path' => 'app/Jobs',
          'generate' => false,
        ),
        'helpers' => 
        array (
          'path' => 'app/Helpers',
          'generate' => false,
        ),
        'interfaces' => 
        array (
          'path' => 'app/Interfaces',
          'generate' => false,
        ),
        'listener' => 
        array (
          'path' => 'app/Listeners',
          'generate' => false,
        ),
        'model' => 
        array (
          'path' => 'app/Models',
          'generate' => false,
        ),
        'notifications' => 
        array (
          'path' => 'app/Notifications',
          'generate' => false,
        ),
        'observer' => 
        array (
          'path' => 'app/Observers',
          'generate' => false,
        ),
        'policies' => 
        array (
          'path' => 'app/Policies',
          'generate' => false,
        ),
        'provider' => 
        array (
          'path' => 'app/Providers',
          'generate' => true,
        ),
        'repository' => 
        array (
          'path' => 'app/Repositories',
          'generate' => false,
        ),
        'resource' => 
        array (
          'path' => 'app/Transformers',
          'generate' => false,
        ),
        'route-provider' => 
        array (
          'path' => 'app/Providers',
          'generate' => true,
        ),
        'rules' => 
        array (
          'path' => 'app/Rules',
          'generate' => false,
        ),
        'services' => 
        array (
          'path' => 'app/Services',
          'generate' => false,
        ),
        'scopes' => 
        array (
          'path' => 'app/Models/Scopes',
          'generate' => false,
        ),
        'traits' => 
        array (
          'path' => 'app/Traits',
          'generate' => false,
        ),
        'controller' => 
        array (
          'path' => 'app/Http/Controllers',
          'generate' => true,
        ),
        'filter' => 
        array (
          'path' => 'app/Http/Middleware',
          'generate' => false,
        ),
        'request' => 
        array (
          'path' => 'app/Http/Requests',
          'generate' => false,
        ),
        'config' => 
        array (
          'path' => 'config',
          'generate' => true,
        ),
        'factory' => 
        array (
          'path' => 'database/factories',
          'generate' => true,
        ),
        'migration' => 
        array (
          'path' => 'database/migrations',
          'generate' => true,
        ),
        'seeder' => 
        array (
          'path' => 'database/seeders',
          'generate' => true,
        ),
        'lang' => 
        array (
          'path' => 'lang',
          'generate' => false,
        ),
        'assets' => 
        array (
          'path' => 'resources/assets',
          'generate' => true,
        ),
        'component-view' => 
        array (
          'path' => 'resources/views/components',
          'generate' => false,
        ),
        'views' => 
        array (
          'path' => 'resources/views',
          'generate' => true,
        ),
        'routes' => 
        array (
          'path' => 'routes',
          'generate' => true,
        ),
        'test-feature' => 
        array (
          'path' => 'tests/Feature',
          'generate' => true,
        ),
        'test-unit' => 
        array (
          'path' => 'tests/Unit',
          'generate' => true,
        ),
      ),
    ),
    'auto-discover' => 
    array (
      'migrations' => true,
      'translations' => false,
    ),
    'commands' => 
    array (
      0 => 'Nwidart\\Modules\\Commands\\Actions\\CheckLangCommand',
      1 => 'Nwidart\\Modules\\Commands\\Actions\\DisableCommand',
      2 => 'Nwidart\\Modules\\Commands\\Actions\\DumpCommand',
      3 => 'Nwidart\\Modules\\Commands\\Actions\\EnableCommand',
      4 => 'Nwidart\\Modules\\Commands\\Actions\\InstallCommand',
      5 => 'Nwidart\\Modules\\Commands\\Actions\\ListCommand',
      6 => 'Nwidart\\Modules\\Commands\\Actions\\ModelPruneCommand',
      7 => 'Nwidart\\Modules\\Commands\\Actions\\ModelShowCommand',
      8 => 'Nwidart\\Modules\\Commands\\Actions\\ModuleDeleteCommand',
      9 => 'Nwidart\\Modules\\Commands\\Actions\\UnUseCommand',
      10 => 'Nwidart\\Modules\\Commands\\Actions\\UpdateCommand',
      11 => 'Nwidart\\Modules\\Commands\\Actions\\UseCommand',
      12 => 'Nwidart\\Modules\\Commands\\Database\\MigrateCommand',
      13 => 'Nwidart\\Modules\\Commands\\Database\\MigrateRefreshCommand',
      14 => 'Nwidart\\Modules\\Commands\\Database\\MigrateResetCommand',
      15 => 'Nwidart\\Modules\\Commands\\Database\\MigrateRollbackCommand',
      16 => 'Nwidart\\Modules\\Commands\\Database\\MigrateStatusCommand',
      17 => 'Nwidart\\Modules\\Commands\\Database\\SeedCommand',
      18 => 'Nwidart\\Modules\\Commands\\Make\\ActionMakeCommand',
      19 => 'Nwidart\\Modules\\Commands\\Make\\CastMakeCommand',
      20 => 'Nwidart\\Modules\\Commands\\Make\\ChannelMakeCommand',
      21 => 'Nwidart\\Modules\\Commands\\Make\\ClassMakeCommand',
      22 => 'Nwidart\\Modules\\Commands\\Make\\CommandMakeCommand',
      23 => 'Nwidart\\Modules\\Commands\\Make\\ComponentClassMakeCommand',
      24 => 'Nwidart\\Modules\\Commands\\Make\\ComponentViewMakeCommand',
      25 => 'Nwidart\\Modules\\Commands\\Make\\ControllerMakeCommand',
      26 => 'Nwidart\\Modules\\Commands\\Make\\EventMakeCommand',
      27 => 'Nwidart\\Modules\\Commands\\Make\\EventProviderMakeCommand',
      28 => 'Nwidart\\Modules\\Commands\\Make\\EnumMakeCommand',
      29 => 'Nwidart\\Modules\\Commands\\Make\\ExceptionMakeCommand',
      30 => 'Nwidart\\Modules\\Commands\\Make\\FactoryMakeCommand',
      31 => 'Nwidart\\Modules\\Commands\\Make\\InterfaceMakeCommand',
      32 => 'Nwidart\\Modules\\Commands\\Make\\HelperMakeCommand',
      33 => 'Nwidart\\Modules\\Commands\\Make\\JobMakeCommand',
      34 => 'Nwidart\\Modules\\Commands\\Make\\ListenerMakeCommand',
      35 => 'Nwidart\\Modules\\Commands\\Make\\MailMakeCommand',
      36 => 'Nwidart\\Modules\\Commands\\Make\\MiddlewareMakeCommand',
      37 => 'Nwidart\\Modules\\Commands\\Make\\MigrationMakeCommand',
      38 => 'Nwidart\\Modules\\Commands\\Make\\ModelMakeCommand',
      39 => 'Nwidart\\Modules\\Commands\\Make\\ModuleMakeCommand',
      40 => 'Nwidart\\Modules\\Commands\\Make\\NotificationMakeCommand',
      41 => 'Nwidart\\Modules\\Commands\\Make\\ObserverMakeCommand',
      42 => 'Nwidart\\Modules\\Commands\\Make\\PolicyMakeCommand',
      43 => 'Nwidart\\Modules\\Commands\\Make\\ProviderMakeCommand',
      44 => 'Nwidart\\Modules\\Commands\\Make\\RepositoryMakeCommand',
      45 => 'Nwidart\\Modules\\Commands\\Make\\RequestMakeCommand',
      46 => 'Nwidart\\Modules\\Commands\\Make\\ResourceMakeCommand',
      47 => 'Nwidart\\Modules\\Commands\\Make\\RouteProviderMakeCommand',
      48 => 'Nwidart\\Modules\\Commands\\Make\\RuleMakeCommand',
      49 => 'Nwidart\\Modules\\Commands\\Make\\ScopeMakeCommand',
      50 => 'Nwidart\\Modules\\Commands\\Make\\SeedMakeCommand',
      51 => 'Nwidart\\Modules\\Commands\\Make\\ServiceMakeCommand',
      52 => 'Nwidart\\Modules\\Commands\\Make\\TraitMakeCommand',
      53 => 'Nwidart\\Modules\\Commands\\Make\\TestMakeCommand',
      54 => 'Nwidart\\Modules\\Commands\\Make\\ViewMakeCommand',
      55 => 'Nwidart\\Modules\\Commands\\Publish\\PublishCommand',
      56 => 'Nwidart\\Modules\\Commands\\Publish\\PublishConfigurationCommand',
      57 => 'Nwidart\\Modules\\Commands\\Publish\\PublishMigrationCommand',
      58 => 'Nwidart\\Modules\\Commands\\Publish\\PublishTranslationCommand',
      59 => 'Nwidart\\Modules\\Commands\\ComposerUpdateCommand',
      60 => 'Nwidart\\Modules\\Commands\\LaravelModulesV6Migrator',
      61 => 'Nwidart\\Modules\\Commands\\SetupCommand',
      62 => 'Nwidart\\Modules\\Commands\\UpdatePhpunitCoverage',
      63 => 'Nwidart\\Modules\\Commands\\Database\\MigrateFreshCommand',
    ),
    'scan' => 
    array (
      'enabled' => false,
      'paths' => 
      array (
        0 => 'D:\\Apps\\snd-app\\vendor/*/*',
      ),
    ),
    'composer' => 
    array (
      'vendor' => 'nwidart',
      'author' => 
      array (
        'name' => 'Nicolas Widart',
        'email' => 'n.widart@gmail.com',
      ),
      'composer-output' => false,
    ),
    'register' => 
    array (
      'translations' => true,
      'files' => 'register',
    ),
    'activators' => 
    array (
      'file' => 
      array (
        'class' => 'Nwidart\\Modules\\Activators\\FileActivator',
        'statuses-file' => 'D:\\Apps\\snd-app\\modules_statuses.json',
      ),
    ),
    'activator' => 'file',
  ),
  'notifications' => 
  array (
    'name' => 'Notifications',
    'settings' => 
    array (
      'default_channel' => 'database',
      'available_channels' => 
      array (
        0 => 'database',
        1 => 'mail',
        2 => 'sms',
        3 => 'slack',
      ),
    ),
    'email' => 
    array (
      'enabled' => true,
      'from' => 
      array (
        'address' => 'hello@example.com',
        'name' => 'Laravel',
      ),
    ),
    'sms' => 
    array (
      'enabled' => false,
      'provider' => 'twilio',
    ),
    'push' => 
    array (
      'enabled' => false,
      'provider' => 'firebase',
    ),
  ),
  'payroll' => 
  array (
    'name' => 'Payroll',
    'settings' => 
    array (
      'default_currency' => 'SAR',
      'payment_methods' => 
      array (
        0 => 'bank_transfer',
        1 => 'cash',
        2 => 'check',
      ),
      'payment_frequency' => 
      array (
        0 => 'monthly',
        1 => 'bi-weekly',
        2 => 'weekly',
      ),
    ),
    'taxes' => 
    array (
      'enabled' => true,
      'default_tax_rate' => 15,
    ),
    'deductions' => 
    array (
      'types' => 
      array (
        0 => 'tax',
        1 => 'insurance',
        2 => 'loan',
        3 => 'advance',
      ),
    ),
    'cycles' => 
    array (
      'start_day' => 1,
      'end_day' => 'last',
      'processing_day' => 25,
    ),
  ),
  'permission' => 
  array (
    'models' => 
    array (
      'permission' => 'Spatie\\Permission\\Models\\Permission',
      'role' => 'Spatie\\Permission\\Models\\Role',
    ),
    'table_names' => 
    array (
      'roles' => 'roles',
      'permissions' => 'permissions',
      'model_has_permissions' => 'model_has_permissions',
      'model_has_roles' => 'model_has_roles',
      'role_has_permissions' => 'role_has_permissions',
    ),
    'column_names' => 
    array (
      'role_pivot_key' => NULL,
      'permission_pivot_key' => NULL,
      'model_morph_key' => 'model_id',
      'team_foreign_key' => 'team_id',
    ),
    'register_permission_check_method' => true,
    'register_octane_reset_listener' => false,
    'events_enabled' => false,
    'teams' => false,
    'team_resolver' => 'Spatie\\Permission\\DefaultTeamResolver',
    'use_passport_client_credentials' => false,
    'display_permission_in_exception' => false,
    'display_role_in_exception' => false,
    'enable_wildcard_permission' => false,
    'cache' => 
    array (
      'expiration_time' => 
      \DateInterval::__set_state(array(
         'from_string' => true,
         'date_string' => '24 hours',
      )),
      'key' => 'spatie.permission.cache',
      'store' => 'default',
    ),
  ),
  'queue' => 
  array (
    'default' => 'database',
    'connections' => 
    array (
      'sync' => 
      array (
        'driver' => 'sync',
      ),
      'database' => 
      array (
        'driver' => 'database',
        'connection' => NULL,
        'table' => 'jobs',
        'queue' => 'default',
        'retry_after' => 90,
        'after_commit' => false,
      ),
      'beanstalkd' => 
      array (
        'driver' => 'beanstalkd',
        'host' => 'localhost',
        'queue' => 'default',
        'retry_after' => 90,
        'block_for' => 0,
        'after_commit' => false,
      ),
      'sqs' => 
      array (
        'driver' => 'sqs',
        'key' => '',
        'secret' => '',
        'prefix' => 'https://sqs.us-east-1.amazonaws.com/your-account-id',
        'queue' => 'default',
        'suffix' => NULL,
        'region' => 'us-east-1',
        'after_commit' => false,
      ),
      'redis' => 
      array (
        'driver' => 'redis',
        'connection' => 'default',
        'queue' => 'default',
        'retry_after' => 90,
        'block_for' => NULL,
        'after_commit' => false,
      ),
    ),
    'batching' => 
    array (
      'database' => 'pgsql',
      'table' => 'job_batches',
    ),
    'failed' => 
    array (
      'driver' => 'database-uuids',
      'database' => 'pgsql',
      'table' => 'failed_jobs',
    ),
  ),
  'rentalmanagement' => 
  array (
    'name' => 'Rental',
    'automated_followups' => 
    array (
      'enabled' => true,
      'delay_days' => 3,
      'default_template' => 'Thank you for your recent rental! Please leave your feedback.',
    ),
  ),
  'reporting' => 
  array (
    'name' => 'Reporting',
    'reports' => 
    array (
      'types' => 
      array (
        0 => 'financial',
        1 => 'equipment_usage',
        2 => 'employee_performance',
        3 => 'project_progress',
        4 => 'maintenance',
        5 => 'audit',
      ),
      'formats' => 
      array (
        0 => 'pdf',
        1 => 'excel',
        2 => 'csv',
        3 => 'html',
      ),
      'default_format' => 'pdf',
    ),
    'charts' => 
    array (
      'types' => 
      array (
        0 => 'bar',
        1 => 'line',
        2 => 'pie',
        3 => 'doughnut',
        4 => 'area',
        5 => 'scatter',
      ),
      'library' => 'chartjs',
      'default_color_palette' => 
      array (
        0 => '#4A90E2',
        1 => '#50E3C2',
        2 => '#F8E71C',
        3 => '#FF6B6B',
        4 => '#9013FE',
        5 => '#FF9500',
      ),
    ),
    'exports' => 
    array (
      'max_rows' => 10000,
      'chunk_size' => 1000,
      'queue' => true,
    ),
    'scheduled_reports' => 
    array (
      'enabled' => true,
      'max_per_user' => 10,
      'frequencies' => 
      array (
        0 => 'daily',
        1 => 'weekly',
        2 => 'monthly',
        3 => 'quarterly',
        4 => 'yearly',
      ),
    ),
  ),
  'sanctum' => 
  array (
    'stateful' => 
    array (
      0 => 'localhost',
      1 => '127.0.0.1',
      2 => 'snd-app.test',
    ),
    'guard' => 
    array (
      0 => 'web',
    ),
    'expiration' => NULL,
    'token_prefix' => '',
    'middleware' => 
    array (
      'authenticate_session' => 'Laravel\\Sanctum\\Http\\Middleware\\AuthenticateSession',
      'encrypt_cookies' => 'Illuminate\\Cookie\\Middleware\\EncryptCookies',
      'validate_csrf_token' => 'Illuminate\\Foundation\\Http\\Middleware\\ValidateCsrfToken',
    ),
  ),
  'services' => 
  array (
    'postmark' => 
    array (
      'token' => NULL,
    ),
    'resend' => 
    array (
      'key' => NULL,
    ),
    'ses' => 
    array (
      'key' => '',
      'secret' => '',
      'region' => 'us-east-1',
    ),
    'slack' => 
    array (
      'notifications' => 
      array (
        'bot_user_oauth_token' => NULL,
        'channel' => NULL,
      ),
    ),
    'google' => 
    array (
      'client_id' => NULL,
      'client_secret' => NULL,
      'redirect' => 'https://snd-app.test/auth/callback/google',
    ),
    'facebook' => 
    array (
      'client_id' => NULL,
      'client_secret' => NULL,
      'redirect' => NULL,
    ),
    'github' => 
    array (
      'client_id' => NULL,
      'client_secret' => NULL,
      'redirect' => NULL,
    ),
    'linkedin' => 
    array (
      'client_id' => NULL,
      'client_secret' => NULL,
      'redirect' => NULL,
    ),
    'microsoft' => 
    array (
      'client_id' => NULL,
      'client_secret' => NULL,
      'redirect' => 'https://snd-app.test/auth/callback/microsoft',
    ),
    'whatsapp' => 
    array (
      'client_id' => NULL,
      'client_secret' => NULL,
      'redirect' => 'https://snd-app.test/auth/callback/whatsapp',
    ),
    'erpnext' => 
    array (
      'url' => 'https://erp.snd-ksa.online',
      'api_key' => '4f15149f23e29b8',
      'api_secret' => '0da352a0df97747',
    ),
  ),
  'session' => 
  array (
    'driver' => 'database',
    'lifetime' => 120,
    'expire_on_close' => false,
    'encrypt' => false,
    'files' => 'D:\\Apps\\snd-app\\storage\\framework/sessions',
    'connection' => NULL,
    'table' => 'sessions',
    'store' => NULL,
    'lottery' => 
    array (
      0 => 2,
      1 => 100,
    ),
    'cookie' => 'laravel_session',
    'path' => '/',
    'domain' => NULL,
    'secure' => NULL,
    'http_only' => true,
    'same_site' => 'lax',
    'partitioned' => false,
  ),
  'settings' => 
  array (
    'name' => 'Settings',
    'description' => 'Manage application settings',
    'cache' => 
    array (
      'enabled' => true,
      'ttl' => 86400,
    ),
    'groups' => 
    array (
      'company' => 
      array (
        'name' => 'Company',
        'description' => 'Company information and settings',
        'icon' => 'building',
      ),
      'system' => 
      array (
        'name' => 'System',
        'description' => 'Application system settings',
        'icon' => 'cog',
      ),
      'notifications' => 
      array (
        'name' => 'Notifications',
        'description' => 'Notification preferences and settings',
        'icon' => 'bell',
      ),
      'payroll' => 
      array (
        'name' => 'Payroll',
        'description' => 'Payroll processing settings',
        'icon' => 'money',
      ),
    ),
    'types' => 
    array (
      'string' => 
      array (
        'component' => 'TextInput',
        'default' => '',
      ),
      'boolean' => 
      array (
        'component' => 'ToggleSwitch',
        'default' => false,
      ),
      'integer' => 
      array (
        'component' => 'NumberInput',
        'default' => 0,
      ),
      'float' => 
      array (
        'component' => 'NumberInput',
        'default' => 0.0,
      ),
      'array' => 
      array (
        'component' => 'ArrayInput',
        'default' => 
        array (
        ),
      ),
      'json' => 
      array (
        'component' => 'JsonEditor',
        'default' => '{}',
      ),
    ),
  ),
  'telescope' => 
  array (
    'enabled' => true,
    'domain' => NULL,
    'path' => 'telescope',
    'driver' => 'database',
    'storage' => 
    array (
      'database' => 
      array (
        'connection' => 'pgsql',
        'chunk' => 1000,
      ),
    ),
    'queue' => 
    array (
      'connection' => NULL,
      'queue' => NULL,
      'delay' => 10,
    ),
    'middleware' => 
    array (
      0 => 'web',
      1 => 'Laravel\\Telescope\\Http\\Middleware\\Authorize',
    ),
    'only_paths' => 
    array (
    ),
    'ignore_paths' => 
    array (
      0 => 'livewire*',
      1 => 'nova-api*',
      2 => 'pulse*',
    ),
    'ignore_commands' => 
    array (
    ),
    'watchers' => 
    array (
      'Laravel\\Telescope\\Watchers\\BatchWatcher' => true,
      'Laravel\\Telescope\\Watchers\\CacheWatcher' => 
      array (
        'enabled' => true,
        'hidden' => 
        array (
        ),
        'ignore' => 
        array (
        ),
      ),
      'Laravel\\Telescope\\Watchers\\ClientRequestWatcher' => true,
      'Laravel\\Telescope\\Watchers\\CommandWatcher' => 
      array (
        'enabled' => true,
        'ignore' => 
        array (
        ),
      ),
      'Laravel\\Telescope\\Watchers\\DumpWatcher' => 
      array (
        'enabled' => true,
        'always' => false,
      ),
      'Laravel\\Telescope\\Watchers\\EventWatcher' => 
      array (
        'enabled' => true,
        'ignore' => 
        array (
        ),
      ),
      'Laravel\\Telescope\\Watchers\\ExceptionWatcher' => true,
      'Laravel\\Telescope\\Watchers\\GateWatcher' => 
      array (
        'enabled' => true,
        'ignore_abilities' => 
        array (
        ),
        'ignore_packages' => true,
        'ignore_paths' => 
        array (
        ),
      ),
      'Laravel\\Telescope\\Watchers\\JobWatcher' => true,
      'Laravel\\Telescope\\Watchers\\LogWatcher' => 
      array (
        'enabled' => true,
        'level' => 'error',
      ),
      'Laravel\\Telescope\\Watchers\\MailWatcher' => true,
      'Laravel\\Telescope\\Watchers\\ModelWatcher' => 
      array (
        'enabled' => true,
        'events' => 
        array (
          0 => 'eloquent.*',
        ),
        'hydrations' => true,
      ),
      'Laravel\\Telescope\\Watchers\\NotificationWatcher' => true,
      'Laravel\\Telescope\\Watchers\\QueryWatcher' => 
      array (
        'enabled' => true,
        'ignore_packages' => true,
        'ignore_paths' => 
        array (
        ),
        'slow' => 100,
      ),
      'Laravel\\Telescope\\Watchers\\RedisWatcher' => true,
      'Laravel\\Telescope\\Watchers\\RequestWatcher' => 
      array (
        'enabled' => true,
        'size_limit' => 64,
        'ignore_http_methods' => 
        array (
        ),
        'ignore_status_codes' => 
        array (
        ),
      ),
      'Laravel\\Telescope\\Watchers\\ScheduleWatcher' => true,
      'Laravel\\Telescope\\Watchers\\ViewWatcher' => true,
    ),
  ),
  'timesheetmanagement' => 
  array (
    'name' => 'TimesheetManagement',
    'default_working_hours' => 8,
    'work_days' => 
    array (
      0 => 1,
      1 => 2,
      2 => 3,
      3 => 4,
      4 => 5,
    ),
    'allow_future_submissions' => false,
    'max_past_days_editable' => 14,
    'allow_overtime' => true,
    'require_project_assignment' => true,
    'require_task_assignment' => true,
    'approval' => 
    array (
      'enabled' => true,
      'levels' => 1,
      'auto_approval_after_days' => 0,
    ),
    'time_rounding' => 
    array (
      'enabled' => true,
      'increment' => 15,
      'method' => 'nearest',
    ),
    'notifications' => 
    array (
      'reminder_day' => 5,
      'send_daily_reminders' => false,
      'send_weekly_reminders' => true,
      'notify_manager_on_submission' => true,
      'notify_employee_on_approval' => true,
    ),
    'lock_timesheet_after_approval' => true,
    'export_formats' => 
    array (
      0 => 'csv',
      1 => 'xlsx',
      2 => 'pdf',
    ),
  ),
  'tinker' => 
  array (
    'commands' => 
    array (
    ),
    'alias' => 
    array (
    ),
    'dont_alias' => 
    array (
      0 => 'App\\Nova',
    ),
  ),
  'ziggy' => 
  array (
    'except' => 
    array (
      0 => 'debugbar::*',
      1 => 'ignition::*',
      2 => 'telescope::*',
    ),
    'url' => 'https://snd-app.test',
    'port' => NULL,
    'group' => false,
    'only' => 
    array (
      0 => '*',
    ),
  ),
  'broadcasting' => 
  array (
    'default' => 'log',
    'connections' => 
    array (
      'reverb' => 
      array (
        'driver' => 'reverb',
        'key' => NULL,
        'secret' => NULL,
        'app_id' => NULL,
        'options' => 
        array (
          'host' => NULL,
          'port' => 443,
          'scheme' => 'https',
          'useTLS' => true,
        ),
        'client_options' => 
        array (
        ),
      ),
      'pusher' => 
      array (
        'driver' => 'pusher',
        'key' => NULL,
        'secret' => NULL,
        'app_id' => NULL,
        'options' => 
        array (
          'cluster' => NULL,
          'host' => 'api-mt1.pusher.com',
          'port' => 443,
          'scheme' => 'https',
          'encrypted' => true,
          'useTLS' => true,
        ),
        'client_options' => 
        array (
        ),
      ),
      'ably' => 
      array (
        'driver' => 'ably',
        'key' => NULL,
      ),
      'log' => 
      array (
        'driver' => 'log',
      ),
      'null' => 
      array (
        'driver' => 'null',
      ),
    ),
  ),
  'concurrency' => 
  array (
    'default' => 'process',
  ),
  'hashing' => 
  array (
    'driver' => 'bcrypt',
    'bcrypt' => 
    array (
      'rounds' => '12',
      'verify' => true,
      'limit' => NULL,
    ),
    'argon' => 
    array (
      'memory' => 65536,
      'threads' => 1,
      'time' => 4,
      'verify' => true,
    ),
    'rehash_on_login' => true,
  ),
  'view' => 
  array (
    'paths' => 
    array (
      0 => 'D:\\Apps\\snd-app\\resources\\views',
    ),
    'compiled' => 'D:\\Apps\\snd-app\\storage\\framework\\views',
  ),
  'companymanagement' => 
  array (
    'name' => 'CompanyManagement',
  ),
  'employeemanagement' => 
  array (
    'name' => 'EmployeeManagement',
  ),
  'projectmanagement' => 
  array (
    'name' => 'ProjectManagement',
  ),
  'rental' => 
  array (
    'name' => 'Rental',
    'automated_followups' => 
    array (
      'enabled' => true,
      'delay_days' => 3,
      'default_template' => 'Thank you for your recent rental! Please leave your feedback.',
    ),
  ),
);
