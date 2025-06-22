<?php

namespace Modules\Settings\Services;

use Illuminate\Support\Facades\Cache;
use Modules\Settings\Domain\Models\Setting;

class ReportSettingsService
{
    private const CACHE_KEY = 'report_settings';
    private const CACHE_TTL = 3600; // 1 hour

    /**
     * Get report settings
     */
    public function getSettings(): array
    {
        return Cache::remember(self::CACHE_KEY, self::CACHE_TTL, function () {
            $settings = Setting::where('group', 'reports')->get();
            
            $reportSettings = [
                'default_format' => 'pdf',
                'auto_generate_reports' => true,
                'report_retention_days' => 90,
                'email_reports' => false,
                'include_charts' => true,
                'report_templates' => [
                    'timesheet_summary',
                    'payroll_report',
                    'equipment_utilization',
                    'project_progress',
                    'customer_billing'
                ],
                'scheduled_reports' => []
            ];

            foreach ($settings as $setting) {
                $key = str_replace('reports.', '', $setting->key);
                $reportSettings[$key] = $this->castValue($setting->value, $setting->type);
            }

            return $reportSettings;
        });
    }

    /**
     * Update report settings
     */
    public function updateSettings(array $data): array
    {
        foreach ($data as $key => $value) {
            $settingKey = "reports.{$key}";
            
            Setting::updateOrCreate(
                [
                    'key' => $settingKey,
                    'group' => 'reports'
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
            'default_format' => 'Default format for generated reports (pdf, excel, csv)',
            'auto_generate_reports' => 'Automatically generate scheduled reports',
            'report_retention_days' => 'Number of days to retain generated reports',
            'email_reports' => 'Email reports to recipients automatically',
            'include_charts' => 'Include charts and graphs in reports',
            'report_templates' => 'Available report templates',
            'scheduled_reports' => 'Scheduled report configurations',
            default => "Report setting for {$key}",
        };
    }
} 