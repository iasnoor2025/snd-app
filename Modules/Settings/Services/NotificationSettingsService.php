<?php

namespace Modules\Settings\Services;

use Illuminate\Support\Facades\Cache;
use Modules\Settings\Domain\Models\Setting;

class NotificationSettingsService
{
    private const CACHE_KEY = 'notification_settings';
    private const CACHE_TTL = 3600; // 1 hour

    /**
     * Get notification settings
     */
    public function getSettings(): array
    {
        return Cache::remember(self::CACHE_KEY, self::CACHE_TTL, function () {
            $settings = Setting::where('group', 'notifications')->get();
            
            $notificationSettings = [
                'email_notifications' => true,
                'sms_notifications' => false,
                'push_notifications' => true,
                'notification_frequency' => 'immediate',
                'notification_types' => [
                    'rental_reminders',
                    'payment_due',
                    'equipment_maintenance',
                    'project_updates',
                    'employee_updates'
                ]
            ];

            foreach ($settings as $setting) {
                $key = str_replace('notifications.', '', $setting->key);
                $notificationSettings[$key] = $this->castValue($setting->value, $setting->type);
            }

            return $notificationSettings;
        });
    }

    /**
     * Update notification settings
     */
    public function updateSettings(array $data): array
    {
        foreach ($data as $key => $value) {
            $settingKey = "notifications.{$key}";
            
            Setting::updateOrCreate(
                [
                    'key' => $settingKey,
                    'group' => 'notifications'
                ],
                [
                    'value' => is_array($value) ? json_encode($value) : (string) $value,
                    'type' => $this->getValueType($value),
                    'description' => $this->getSettingDescription($key)
                ]
            );
        }

        // Clear cache
        Cache::forget(self::CACHE_KEY);

        return $this->getSettings();
    }

    /**
     * Cast value based on type
     */
    private function castValue(string $value, string $type): mixed
    {
        return match($type) {
            'boolean' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
            'integer' => (int) $value,
            'float' => (float) $value,
            'array' => json_decode($value, true),
            default => $value,
        };
    }

    /**
     * Get value type
     */
    private function getValueType(mixed $value): string
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
     * Get setting description
     */
    private function getSettingDescription(string $key): string
    {
        return match($key) {
            'email_notifications' => 'Enable or disable email notifications',
            'sms_notifications' => 'Enable or disable SMS notifications',
            'push_notifications' => 'Enable or disable push notifications',
            'notification_frequency' => 'How often to send notifications (immediate, daily, weekly)',
            'notification_types' => 'Types of notifications to send',
            default => "Notification setting for {$key}",
        };
    }
} 