<?php

namespace Modules\Settings\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Modules\Settings\Services\SettingService;
use Inertia\Inertia;

class ReportSettingsController extends Controller
{
    protected $settingService;

    public function __construct(SettingService $settingService)
    {
        $this->settingService = $settingService;
    }

    public function index()
    {
        // Get report settings from database
        $reportSettings = $this->settingService->getSettingsByGroup('reports');
        $systemSettings = $this->settingService->getSettingsByGroup('system');

        // Convert to key-value array
        $settings = [];
        foreach ($reportSettings as $setting) {
            $value = $setting->value;
            // Convert string booleans to actual booleans
            if ($value === 'true' || $value === 'false') {
                $value = $value === 'true';
            }
            // Convert numeric strings to numbers
            if (is_numeric($value)) {
                $value = is_float($value) ? (float)$value : (int)$value;
            }
            $settings[$setting->key] = $value;
        }

        // Get timezone from system settings
        foreach ($systemSettings as $setting) {
            if ($setting->key === 'timezone') {
                $settings['report_timezone'] = $setting->value;
                break;
            }
        }

        // Set default values for missing settings
        $defaultSettings = [
            'auto_generate_reports' => false,
            'report_frequency' => 'monthly',
            'report_format' => 'pdf',
            'email_reports' => false,
            'report_recipients' => '',
            'include_charts' => true,
            'include_summary' => true,
            'include_details' => true,
            'retention_period' => 12,
            'compress_reports' => false,
            'watermark_reports' => true,
            'custom_logo' => true,
            'report_timezone' => 'UTC',
            'date_range_default' => 'last_month',
        ];

        $settings = array_merge($defaultSettings, $settings);

        // Get timezone options
        $timezones = $this->getTimezoneOptions();

        return Inertia::render('Settings/Reports', [
            'settings' => $settings,
            'timezones' => $timezones,
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'auto_generate_reports' => 'boolean',
            'report_frequency' => 'required|string|in:daily,weekly,monthly,quarterly,yearly',
            'report_format' => 'required|string|in:pdf,excel,csv,html',
            'email_reports' => 'boolean',
            'report_recipients' => 'nullable|string',
            'include_charts' => 'boolean',
            'include_summary' => 'boolean',
            'include_details' => 'boolean',
            'retention_period' => 'required|integer|min:1|max:120',
            'compress_reports' => 'boolean',
            'watermark_reports' => 'boolean',
            'custom_logo' => 'boolean',
            'report_timezone' => 'required|string',
            'date_range_default' => 'required|string|in:last_week,last_month,last_quarter,last_year,current_month,current_quarter,current_year',
        ]);

        // Validate email recipients if email reports are enabled
        if ($request->boolean('email_reports') && $request->filled('report_recipients')) {
            $emails = array_map('trim', explode(',', $request->report_recipients));
            foreach ($emails as $email) {
                if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                    return redirect()->back()->withErrors([
                        'report_recipients' => "Invalid email address: {$email}"
                    ]);
                }
            }
        }

        // Update report settings
        $reportSettings = [
            'auto_generate_reports' => $request->boolean('auto_generate_reports'),
            'report_frequency' => $request->report_frequency,
            'report_format' => $request->report_format,
            'email_reports' => $request->boolean('email_reports'),
            'report_recipients' => $request->report_recipients ?? '',
            'include_charts' => $request->boolean('include_charts'),
            'include_summary' => $request->boolean('include_summary'),
            'include_details' => $request->boolean('include_details'),
            'retention_period' => $request->retention_period,
            'compress_reports' => $request->boolean('compress_reports'),
            'watermark_reports' => $request->boolean('watermark_reports'),
            'custom_logo' => $request->boolean('custom_logo'),
            'date_range_default' => $request->date_range_default,
        ];

        foreach ($reportSettings as $key => $value) {
            $this->settingService->updateSetting($key, $value, 'reports');
        }

        // Update timezone in system settings if different
        $currentTimezone = $this->settingService->getSetting('timezone', 'system');
        if ($currentTimezone !== $request->report_timezone) {
            $this->settingService->updateSetting('timezone', $request->report_timezone, 'system');
        }

        return redirect()->back()->with('success', 'Report settings updated successfully.');
    }

    private function getTimezoneOptions()
    {
        return [
            'UTC' => 'UTC',
            'America/New_York' => 'Eastern Time (US & Canada)',
            'America/Chicago' => 'Central Time (US & Canada)',
            'America/Denver' => 'Mountain Time (US & Canada)',
            'America/Los_Angeles' => 'Pacific Time (US & Canada)',
            'Europe/London' => 'London',
            'Europe/Paris' => 'Paris',
            'Europe/Berlin' => 'Berlin',
            'Asia/Tokyo' => 'Tokyo',
            'Asia/Shanghai' => 'Shanghai',
            'Asia/Kolkata' => 'Mumbai, Kolkata, New Delhi',
            'Australia/Sydney' => 'Sydney',
            'Pacific/Auckland' => 'Auckland',
        ];
    }
}
