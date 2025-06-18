<?php

namespace Modules\Core\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Core\Domain\Models\SystemSetting;
use Illuminate\Support\Facades\DB;

class SystemSettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::transaction(function () {
            $this->seedGeneralSettings();
            $this->seedSecuritySettings();
            $this->seedPerformanceSettings();
            $this->seedNotificationSettings();
            $this->seedMaintenanceSettings();
        });
    }

    /**
     * Seed general settings
     */
    private function seedGeneralSettings(): void
    {
        $settings = [
            [
                'key' => 'app_name',
                'value' => config('app.name', 'SND Rental Management'),
                'type' => 'string',
                'category' => 'general',
                'description' => 'Application name displayed throughout the system',
                'is_public' => true
            ],
            [
                'key' => 'app_description',
                'value' => 'Complete rental management solution for equipment and project management',
                'type' => 'string',
                'category' => 'general',
                'description' => 'Brief description of the application',
                'is_public' => true
            ],
            [
                'key' => 'default_timezone',
                'value' => config('app.timezone', 'UTC'),
                'type' => 'string',
                'category' => 'general',
                'description' => 'Default timezone for the application',
                'is_public' => true
            ],
            [
                'key' => 'default_language',
                'value' => 'en',
                'type' => 'string',
                'category' => 'general',
                'description' => 'Default language for the application',
                'is_public' => true
            ],
            [
                'key' => 'date_format',
                'value' => 'Y-m-d',
                'type' => 'string',
                'category' => 'general',
                'description' => 'Default date format used throughout the application',
                'is_public' => true
            ],
            [
                'key' => 'time_format',
                'value' => 'H:i:s',
                'type' => 'string',
                'category' => 'general',
                'description' => 'Default time format used throughout the application',
                'is_public' => true
            ],
            [
                'key' => 'currency',
                'value' => 'USD',
                'type' => 'string',
                'category' => 'general',
                'description' => 'Default currency for financial calculations',
                'is_public' => true
            ],
            [
                'key' => 'decimal_places',
                'value' => '2',
                'type' => 'integer',
                'category' => 'general',
                'description' => 'Number of decimal places for currency display',
                'is_public' => true
            ],
            [
                'key' => 'company_name',
                'value' => 'SND Rental Company',
                'type' => 'string',
                'category' => 'general',
                'description' => 'Company name for reports and documents',
                'is_public' => true
            ],
            [
                'key' => 'company_address',
                'value' => '',
                'type' => 'string',
                'category' => 'general',
                'description' => 'Company address for reports and documents',
                'is_public' => true
            ],
            [
                'key' => 'company_phone',
                'value' => '',
                'type' => 'string',
                'category' => 'general',
                'description' => 'Company phone number',
                'is_public' => true
            ],
            [
                'key' => 'company_email',
                'value' => '',
                'type' => 'string',
                'category' => 'general',
                'description' => 'Company email address',
                'is_public' => true
            ]
        ];

        $this->insertSettings($settings);
    }

    /**
     * Seed security settings
     */
    private function seedSecuritySettings(): void
    {
        $settings = [
            [
                'key' => 'session_timeout',
                'value' => '120',
                'type' => 'integer',
                'category' => 'security',
                'description' => 'Session timeout in minutes',
                'is_public' => false
            ],
            [
                'key' => 'password_min_length',
                'value' => '8',
                'type' => 'integer',
                'category' => 'security',
                'description' => 'Minimum password length requirement',
                'is_public' => false
            ],
            [
                'key' => 'password_require_uppercase',
                'value' => '1',
                'type' => 'boolean',
                'category' => 'security',
                'description' => 'Require uppercase letters in passwords',
                'is_public' => false
            ],
            [
                'key' => 'password_require_lowercase',
                'value' => '1',
                'type' => 'boolean',
                'category' => 'security',
                'description' => 'Require lowercase letters in passwords',
                'is_public' => false
            ],
            [
                'key' => 'password_require_numbers',
                'value' => '1',
                'type' => 'boolean',
                'category' => 'security',
                'description' => 'Require numbers in passwords',
                'is_public' => false
            ],
            [
                'key' => 'password_require_symbols',
                'value' => '0',
                'type' => 'boolean',
                'category' => 'security',
                'description' => 'Require special symbols in passwords',
                'is_public' => false
            ],
            [
                'key' => 'max_login_attempts',
                'value' => '5',
                'type' => 'integer',
                'category' => 'security',
                'description' => 'Maximum login attempts before account lockout',
                'is_public' => false
            ],
            [
                'key' => 'lockout_duration',
                'value' => '15',
                'type' => 'integer',
                'category' => 'security',
                'description' => 'Account lockout duration in minutes',
                'is_public' => false
            ],
            [
                'key' => 'two_factor_enabled',
                'value' => '0',
                'type' => 'boolean',
                'category' => 'security',
                'description' => 'Enable two-factor authentication',
                'is_public' => false
            ],
            [
                'key' => 'force_https',
                'value' => '1',
                'type' => 'boolean',
                'category' => 'security',
                'description' => 'Force HTTPS connections',
                'is_public' => false
            ]
        ];

        $this->insertSettings($settings);
    }

    /**
     * Seed performance settings
     */
    private function seedPerformanceSettings(): void
    {
        $settings = [
            [
                'key' => 'cache_enabled',
                'value' => '1',
                'type' => 'boolean',
                'category' => 'performance',
                'description' => 'Enable application caching',
                'is_public' => false
            ],
            [
                'key' => 'cache_ttl',
                'value' => '3600',
                'type' => 'integer',
                'category' => 'performance',
                'description' => 'Default cache TTL in seconds',
                'is_public' => false
            ],
            [
                'key' => 'query_cache_enabled',
                'value' => '1',
                'type' => 'boolean',
                'category' => 'performance',
                'description' => 'Enable database query caching',
                'is_public' => false
            ],
            [
                'key' => 'compression_enabled',
                'value' => '1',
                'type' => 'boolean',
                'category' => 'performance',
                'description' => 'Enable response compression',
                'is_public' => false
            ],
            [
                'key' => 'lazy_loading_enabled',
                'value' => '1',
                'type' => 'boolean',
                'category' => 'performance',
                'description' => 'Enable lazy loading for database relationships',
                'is_public' => false
            ],
            [
                'key' => 'pagination_size',
                'value' => '15',
                'type' => 'integer',
                'category' => 'performance',
                'description' => 'Default number of items per page',
                'is_public' => true
            ],
            [
                'key' => 'max_file_upload_size',
                'value' => '10240',
                'type' => 'integer',
                'category' => 'performance',
                'description' => 'Maximum file upload size in KB',
                'is_public' => false
            ],
            [
                'key' => 'image_optimization_enabled',
                'value' => '1',
                'type' => 'boolean',
                'category' => 'performance',
                'description' => 'Enable automatic image optimization',
                'is_public' => false
            ],
            [
                'key' => 'api_rate_limit',
                'value' => '60',
                'type' => 'integer',
                'category' => 'performance',
                'description' => 'API rate limit per minute',
                'is_public' => false
            ]
        ];

        $this->insertSettings($settings);
    }

    /**
     * Seed notification settings
     */
    private function seedNotificationSettings(): void
    {
        $settings = [
            [
                'key' => 'email_notifications_enabled',
                'value' => '1',
                'type' => 'boolean',
                'category' => 'notifications',
                'description' => 'Enable email notifications',
                'is_public' => false
            ],
            [
                'key' => 'sms_notifications_enabled',
                'value' => '0',
                'type' => 'boolean',
                'category' => 'notifications',
                'description' => 'Enable SMS notifications',
                'is_public' => false
            ],
            [
                'key' => 'push_notifications_enabled',
                'value' => '1',
                'type' => 'boolean',
                'category' => 'notifications',
                'description' => 'Enable push notifications',
                'is_public' => false
            ],
            [
                'key' => 'notification_queue_enabled',
                'value' => '1',
                'type' => 'boolean',
                'category' => 'notifications',
                'description' => 'Enable notification queueing for better performance',
                'is_public' => false
            ],
            [
                'key' => 'digest_notifications_enabled',
                'value' => '1',
                'type' => 'boolean',
                'category' => 'notifications',
                'description' => 'Enable digest notifications',
                'is_public' => false
            ],
            [
                'key' => 'digest_frequency',
                'value' => 'daily',
                'type' => 'string',
                'category' => 'notifications',
                'description' => 'Frequency for digest notifications (hourly, daily, weekly)',
                'is_public' => false
            ],
            [
                'key' => 'notification_retention_days',
                'value' => '30',
                'type' => 'integer',
                'category' => 'notifications',
                'description' => 'Number of days to retain notifications',
                'is_public' => false
            ],
            [
                'key' => 'notification_from_email',
                'value' => 'noreply@sndrentals.com',
                'type' => 'string',
                'category' => 'notifications',
                'description' => 'From email address for notifications',
                'is_public' => false
            ],
            [
                'key' => 'notification_from_name',
                'value' => 'SND Rental System',
                'type' => 'string',
                'category' => 'notifications',
                'description' => 'From name for notifications',
                'is_public' => false
            ]
        ];

        $this->insertSettings($settings);
    }

    /**
     * Seed maintenance settings
     */
    private function seedMaintenanceSettings(): void
    {
        $settings = [
            [
                'key' => 'maintenance_mode_enabled',
                'value' => '0',
                'type' => 'boolean',
                'category' => 'maintenance',
                'description' => 'Enable maintenance mode',
                'is_public' => false
            ],
            [
                'key' => 'maintenance_message',
                'value' => 'System is under maintenance. Please try again later.',
                'type' => 'string',
                'category' => 'maintenance',
                'description' => 'Message displayed during maintenance mode',
                'is_public' => true
            ],
            [
                'key' => 'auto_backup_enabled',
                'value' => '1',
                'type' => 'boolean',
                'category' => 'maintenance',
                'description' => 'Enable automatic database backups',
                'is_public' => false
            ],
            [
                'key' => 'backup_frequency',
                'value' => 'daily',
                'type' => 'string',
                'category' => 'maintenance',
                'description' => 'Frequency for automatic backups (hourly, daily, weekly)',
                'is_public' => false
            ],
            [
                'key' => 'backup_retention_days',
                'value' => '30',
                'type' => 'integer',
                'category' => 'maintenance',
                'description' => 'Number of days to retain backups',
                'is_public' => false
            ],
            [
                'key' => 'log_cleanup_enabled',
                'value' => '1',
                'type' => 'boolean',
                'category' => 'maintenance',
                'description' => 'Enable automatic log file cleanup',
                'is_public' => false
            ],
            [
                'key' => 'log_retention_days',
                'value' => '7',
                'type' => 'integer',
                'category' => 'maintenance',
                'description' => 'Number of days to retain log files',
                'is_public' => false
            ],
            [
                'key' => 'temp_file_cleanup_enabled',
                'value' => '1',
                'type' => 'boolean',
                'category' => 'maintenance',
                'description' => 'Enable automatic temporary file cleanup',
                'is_public' => false
            ],
            [
                'key' => 'system_health_check_enabled',
                'value' => '1',
                'type' => 'boolean',
                'category' => 'maintenance',
                'description' => 'Enable automatic system health checks',
                'is_public' => false
            ],
            [
                'key' => 'health_check_frequency',
                'value' => 'hourly',
                'type' => 'string',
                'category' => 'maintenance',
                'description' => 'Frequency for system health checks',
                'is_public' => false
            ]
        ];

        $this->insertSettings($settings);
    }

    /**
     * Insert settings into database
     */
    private function insertSettings(array $settings): void
    {
        foreach ($settings as $setting) {
            SystemSetting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
