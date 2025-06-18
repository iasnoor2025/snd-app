<?php

namespace Modules\Core\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Modules\Core\Domain\Models\SystemSetting;
use Carbon\Carbon;

class SystemSettingsService
{
    /**
     * Get all system settings grouped by category
     */
    public function getAllSettings(): array
    {
        return Cache::remember('system_settings', 3600, function () {
            $settings = SystemSetting::all()->keyBy('key');

            $grouped = [];
            foreach ($settings as $setting) {
                $grouped[$setting->category][$setting->key] = [
                    'value' => $this->castValue($setting->value, $setting->type),
                    'type' => $setting->type,
                    'description' => $setting->description,
                    'is_public' => $setting->is_public,
                    'updated_at' => $setting->updated_at
                ];
            }

            return $grouped;
        });
    }

    /**
     * Get a specific setting value
     */
    public function getSetting(string $key, $default = null)
    {
        $setting = SystemSetting::where('key', $key)->first();

        if (!$setting) {
            return $default;
        }

        return $this->castValue($setting->value, $setting->type);
    }

    /**
     * Update multiple settings
     */
    public function updateSettings(array $settings): void
    {
        DB::transaction(function () use ($settings) {
            foreach ($settings as $category => $categorySettings) {
                foreach ($categorySettings as $key => $value) {
                    $this->updateSetting($key, $value, $category);
                }
            }
        });

        Log::info('System settings updated', ['settings_count' => count($settings)]);
    }

    /**
     * Update a single setting
     */
    public function updateSetting(string $key, $value, string $category = 'general'): void
    {
        $setting = SystemSetting::firstOrCreate(
            ['key' => $key],
            [
                'category' => $category,
                'type' => $this->inferType($value),
                'description' => ucwords(str_replace('_', ' ', $key))
            ]
        );

        $setting->update([
            'value' => $this->serializeValue($value),
            'category' => $category,
            'type' => $this->inferType($value)
        ]);
    }

    /**
     * Reset all settings to defaults
     */
    public function resetAllToDefaults(): void
    {
        DB::transaction(function () {
            SystemSetting::truncate();
            $this->seedDefaultSettings();
        });

        Log::info('All system settings reset to defaults');
    }

    /**
     * Reset specific category to defaults
     */
    public function resetCategoryToDefaults(string $category): void
    {
        DB::transaction(function () use ($category) {
            SystemSetting::where('category', $category)->delete();
            $this->seedCategoryDefaults($category);
        });

        Log::info('System settings category reset to defaults', ['category' => $category]);
    }

    /**
     * Export settings for backup/migration
     */
    public function exportSettings(): array
    {
        $settings = SystemSetting::all();

        return $settings->map(function ($setting) {
            return [
                'key' => $setting->key,
                'value' => $setting->value,
                'type' => $setting->type,
                'category' => $setting->category,
                'description' => $setting->description,
                'is_public' => $setting->is_public
            ];
        })->toArray();
    }

    /**
     * Import settings from backup/migration
     */
    public function importSettings(array $settings, bool $overwriteExisting = false): array
    {
        $imported = 0;
        $skipped = 0;

        DB::transaction(function () use ($settings, $overwriteExisting, &$imported, &$skipped) {
            foreach ($settings as $settingData) {
                $exists = SystemSetting::where('key', $settingData['key'])->exists();

                if ($exists && !$overwriteExisting) {
                    $skipped++;
                    continue;
                }

                SystemSetting::updateOrCreate(
                    ['key' => $settingData['key']],
                    [
                        'value' => $settingData['value'],
                        'type' => $settingData['type'],
                        'category' => $settingData['category'],
                        'description' => $settingData['description'],
                        'is_public' => $settingData['is_public'] ?? false
                    ]
                );

                $imported++;
            }
        });

        Log::info('System settings imported', [
            'imported' => $imported,
            'skipped' => $skipped
        ]);

        return [
            'imported_count' => $imported,
            'skipped_count' => $skipped
        ];
    }

    /**
     * Get system health status
     */
    public function getSystemHealth(): array
    {
        $health = [
            'overall_status' => 'healthy',
            'checks' => [],
            'last_checked' => now()->toISOString()
        ];

        // Database connectivity
        try {
            DB::connection()->getPdo();
            $health['checks']['database'] = [
                'status' => 'healthy',
                'message' => 'Database connection successful'
            ];
        } catch (\Exception $e) {
            $health['checks']['database'] = [
                'status' => 'unhealthy',
                'message' => 'Database connection failed: ' . $e->getMessage()
            ];
            $health['overall_status'] = 'unhealthy';
        }

        // Storage accessibility
        try {
            Storage::disk('local')->put('health-check.txt', 'test');
            Storage::disk('local')->delete('health-check.txt');
            $health['checks']['storage'] = [
                'status' => 'healthy',
                'message' => 'Storage is accessible'
            ];
        } catch (\Exception $e) {
            $health['checks']['storage'] = [
                'status' => 'unhealthy',
                'message' => 'Storage access failed: ' . $e->getMessage()
            ];
            $health['overall_status'] = 'unhealthy';
        }

        // Cache functionality
        try {
            Cache::put('health-check', 'test', 60);
            $cached = Cache::get('health-check');
            Cache::forget('health-check');

            if ($cached === 'test') {
                $health['checks']['cache'] = [
                    'status' => 'healthy',
                    'message' => 'Cache is working properly'
                ];
            } else {
                throw new \Exception('Cache value mismatch');
            }
        } catch (\Exception $e) {
            $health['checks']['cache'] = [
                'status' => 'warning',
                'message' => 'Cache functionality issue: ' . $e->getMessage()
            ];
            if ($health['overall_status'] === 'healthy') {
                $health['overall_status'] = 'warning';
            }
        }

        // Disk space
        $diskSpace = disk_free_space(storage_path());
        $diskTotal = disk_total_space(storage_path());
        $diskUsagePercent = (($diskTotal - $diskSpace) / $diskTotal) * 100;

        if ($diskUsagePercent > 90) {
            $health['checks']['disk_space'] = [
                'status' => 'unhealthy',
                'message' => sprintf('Disk usage is %.1f%% (critically high)', $diskUsagePercent)
            ];
            $health['overall_status'] = 'unhealthy';
        } elseif ($diskUsagePercent > 80) {
            $health['checks']['disk_space'] = [
                'status' => 'warning',
                'message' => sprintf('Disk usage is %.1f%% (high)', $diskUsagePercent)
            ];
            if ($health['overall_status'] === 'healthy') {
                $health['overall_status'] = 'warning';
            }
        } else {
            $health['checks']['disk_space'] = [
                'status' => 'healthy',
                'message' => sprintf('Disk usage is %.1f%%', $diskUsagePercent)
            ];
        }

        return $health;
    }

    /**
     * Cast value to appropriate type
     */
    private function castValue($value, string $type)
    {
        return match ($type) {
            'boolean' => (bool) $value,
            'integer' => (int) $value,
            'float' => (float) $value,
            'array' => json_decode($value, true),
            'json' => json_decode($value, true),
            default => $value
        };
    }

    /**
     * Serialize value for storage
     */
    private function serializeValue($value): string
    {
        if (is_array($value) || is_object($value)) {
            return json_encode($value);
        }

        return (string) $value;
    }

    /**
     * Infer type from value
     */
    private function inferType($value): string
    {
        if (is_bool($value)) {
            return 'boolean';
        }

        if (is_int($value)) {
            return 'integer';
        }

        if (is_float($value)) {
            return 'float';
        }

        if (is_array($value)) {
            return 'array';
        }

        return 'string';
    }

    /**
     * Seed default settings
     */
    private function seedDefaultSettings(): void
    {
        $defaults = $this->getDefaultSettings();

        foreach ($defaults as $category => $settings) {
            $this->seedCategoryDefaults($category);
        }
    }

    /**
     * Seed defaults for specific category
     */
    private function seedCategoryDefaults(string $category): void
    {
        $defaults = $this->getDefaultSettings();

        if (!isset($defaults[$category])) {
            return;
        }

        foreach ($defaults[$category] as $key => $config) {
            SystemSetting::create([
                'key' => $key,
                'value' => $this->serializeValue($config['value']),
                'type' => $config['type'],
                'category' => $category,
                'description' => $config['description'],
                'is_public' => $config['is_public'] ?? false
            ]);
        }
    }

    /**
     * Get default settings configuration
     */
    private function getDefaultSettings(): array
    {
        return [
            'general' => [
                'app_name' => [
                    'value' => config('app.name', 'SND Rental Management'),
                    'type' => 'string',
                    'description' => 'Application name',
                    'is_public' => true
                ],
                'app_description' => [
                    'value' => 'Complete rental management solution',
                    'type' => 'string',
                    'description' => 'Application description',
                    'is_public' => true
                ],
                'default_timezone' => [
                    'value' => config('app.timezone', 'UTC'),
                    'type' => 'string',
                    'description' => 'Default timezone',
                    'is_public' => true
                ],
                'default_language' => [
                    'value' => 'en',
                    'type' => 'string',
                    'description' => 'Default language',
                    'is_public' => true
                ],
                'date_format' => [
                    'value' => 'Y-m-d',
                    'type' => 'string',
                    'description' => 'Date format',
                    'is_public' => true
                ],
                'time_format' => [
                    'value' => 'H:i:s',
                    'type' => 'string',
                    'description' => 'Time format',
                    'is_public' => true
                ],
                'currency' => [
                    'value' => 'USD',
                    'type' => 'string',
                    'description' => 'Default currency',
                    'is_public' => true
                ],
                'decimal_places' => [
                    'value' => 2,
                    'type' => 'integer',
                    'description' => 'Decimal places for currency',
                    'is_public' => true
                ]
            ],
            'security' => [
                'session_timeout' => [
                    'value' => 120,
                    'type' => 'integer',
                    'description' => 'Session timeout in minutes'
                ],
                'password_min_length' => [
                    'value' => 8,
                    'type' => 'integer',
                    'description' => 'Minimum password length'
                ],
                'password_require_uppercase' => [
                    'value' => true,
                    'type' => 'boolean',
                    'description' => 'Require uppercase letters in password'
                ],
                'password_require_lowercase' => [
                    'value' => true,
                    'type' => 'boolean',
                    'description' => 'Require lowercase letters in password'
                ],
                'password_require_numbers' => [
                    'value' => true,
                    'type' => 'boolean',
                    'description' => 'Require numbers in password'
                ],
                'password_require_symbols' => [
                    'value' => false,
                    'type' => 'boolean',
                    'description' => 'Require symbols in password'
                ],
                'max_login_attempts' => [
                    'value' => 5,
                    'type' => 'integer',
                    'description' => 'Maximum login attempts before lockout'
                ],
                'lockout_duration' => [
                    'value' => 15,
                    'type' => 'integer',
                    'description' => 'Lockout duration in minutes'
                ],
                'two_factor_enabled' => [
                    'value' => false,
                    'type' => 'boolean',
                    'description' => 'Enable two-factor authentication'
                ]
            ],
            'performance' => [
                'cache_enabled' => [
                    'value' => true,
                    'type' => 'boolean',
                    'description' => 'Enable application caching'
                ],
                'cache_ttl' => [
                    'value' => 3600,
                    'type' => 'integer',
                    'description' => 'Default cache TTL in seconds'
                ],
                'query_cache_enabled' => [
                    'value' => true,
                    'type' => 'boolean',
                    'description' => 'Enable database query caching'
                ],
                'compression_enabled' => [
                    'value' => true,
                    'type' => 'boolean',
                    'description' => 'Enable response compression'
                ],
                'lazy_loading_enabled' => [
                    'value' => true,
                    'type' => 'boolean',
                    'description' => 'Enable lazy loading for relationships'
                ],
                'pagination_size' => [
                    'value' => 15,
                    'type' => 'integer',
                    'description' => 'Default pagination size'
                ],
                'max_file_upload_size' => [
                    'value' => 10240,
                    'type' => 'integer',
                    'description' => 'Maximum file upload size in KB'
                ],
                'image_optimization_enabled' => [
                    'value' => true,
                    'type' => 'boolean',
                    'description' => 'Enable automatic image optimization'
                ]
            ],
            'notifications' => [
                'email_notifications_enabled' => [
                    'value' => true,
                    'type' => 'boolean',
                    'description' => 'Enable email notifications'
                ],
                'sms_notifications_enabled' => [
                    'value' => false,
                    'type' => 'boolean',
                    'description' => 'Enable SMS notifications'
                ],
                'push_notifications_enabled' => [
                    'value' => true,
                    'type' => 'boolean',
                    'description' => 'Enable push notifications'
                ],
                'notification_queue_enabled' => [
                    'value' => true,
                    'type' => 'boolean',
                    'description' => 'Enable notification queueing'
                ],
                'digest_notifications_enabled' => [
                    'value' => true,
                    'type' => 'boolean',
                    'description' => 'Enable digest notifications'
                ],
                'digest_frequency' => [
                    'value' => 'daily',
                    'type' => 'string',
                    'description' => 'Digest notification frequency'
                ],
                'notification_retention_days' => [
                    'value' => 30,
                    'type' => 'integer',
                    'description' => 'Notification retention period in days'
                ]
            ],
            'maintenance' => [
                'maintenance_mode_enabled' => [
                    'value' => false,
                    'type' => 'boolean',
                    'description' => 'Enable maintenance mode'
                ],
                'maintenance_message' => [
                    'value' => 'System is under maintenance. Please try again later.',
                    'type' => 'string',
                    'description' => 'Maintenance mode message'
                ],
                'auto_backup_enabled' => [
                    'value' => true,
                    'type' => 'boolean',
                    'description' => 'Enable automatic backups'
                ],
                'backup_frequency' => [
                    'value' => 'daily',
                    'type' => 'string',
                    'description' => 'Backup frequency'
                ],
                'backup_retention_days' => [
                    'value' => 30,
                    'type' => 'integer',
                    'description' => 'Backup retention period in days'
                ],
                'log_cleanup_enabled' => [
                    'value' => true,
                    'type' => 'boolean',
                    'description' => 'Enable automatic log cleanup'
                ],
                'log_retention_days' => [
                    'value' => 7,
                    'type' => 'integer',
                    'description' => 'Log retention period in days'
                ],
                'temp_file_cleanup_enabled' => [
                    'value' => true,
                    'type' => 'boolean',
                    'description' => 'Enable automatic temporary file cleanup'
                ]
            ]
        ];
    }
}
