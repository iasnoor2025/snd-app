<?php

namespace Modules\Settings\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Artisan;
use Modules\Settings\Services\SettingService;
use Inertia\Inertia;

class CompanySettingsController extends Controller
{
    protected $settingService;

    public function __construct(SettingService $settingService)
    {
        $this->settingService = $settingService;
    }

    public function index()
    {
        // Get company settings from database
        $companySettings = $this->settingService->getSettingsByGroup('company');
        $systemSettings = $this->settingService->getSettingsByGroup('system');

        // Combine settings
        $settings = [];
        foreach ($companySettings as $setting) {
            $settings[$setting->key] = $setting->value;
        }
        foreach ($systemSettings as $setting) {
            $settings[$setting->key] = $setting->value;
        }

        // Get timezone and currency options
        $timezones = $this->getTimezoneOptions();
        $currencies = $this->getCurrencyOptions();

        return Inertia::render('Settings/Company', [
            'settings' => $settings,
            'timezones' => $timezones,
            'currencies' => $currencies,
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'company_name' => 'required|string|max:255',
            'company_email' => 'required|email|max:255',
            'company_phone' => 'nullable|string|max:20',
            'company_address' => 'nullable|string|max:500',
            'company_website' => 'nullable|url|max:255',
            'company_logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'timezone' => 'required|string',
            'currency' => 'required|string|max:3',
            'date_format' => 'required|string',
            'time_format' => 'required|string',
            'default_language' => 'required|string|max:5',
        ]);

        // Handle logo upload
        $logoPath = null;
        if ($request->hasFile('company_logo')) {
            // Delete old logo if exists
            $oldLogo = $this->settingService->getSetting('company_logo');
            if ($oldLogo && Storage::disk('public')->exists($oldLogo)) {
                Storage::disk('public')->delete($oldLogo);
            }

            // Store new logo
            $logoPath = $request->file('company_logo')->store('company', 'public');
        }

        // Update settings
        $settingsToUpdate = [
            'company_name' => $request->company_name,
            'company_email' => $request->company_email,
            'company_phone' => $request->company_phone,
            'company_address' => $request->company_address,
            'company_website' => $request->company_website,
            'timezone' => $request->timezone,
            'currency' => $request->currency,
            'date_format' => $request->date_format,
            'time_format' => $request->time_format,
            'default_language' => $request->default_language,
        ];

        if ($logoPath) {
            $settingsToUpdate['company_logo'] = $logoPath;
        }

        foreach ($settingsToUpdate as $key => $value) {
            $this->settingService->updateSetting($key, $value);
        }

        return redirect()->back()->with('success', 'Company settings updated successfully.');
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

    private function getCurrencyOptions()
    {
        return [
            'USD' => 'US Dollar ($)',
            'EUR' => 'Euro (€)',
            'GBP' => 'British Pound (£)',
            'JPY' => 'Japanese Yen (¥)',
            'CAD' => 'Canadian Dollar (C$)',
            'AUD' => 'Australian Dollar (A$)',
            'CHF' => 'Swiss Franc (CHF)',
            'CNY' => 'Chinese Yuan (¥)',
            'INR' => 'Indian Rupee (₹)',
            'KRW' => 'South Korean Won (₩)',
            'SGD' => 'Singapore Dollar (S$)',
            'HKD' => 'Hong Kong Dollar (HK$)',
        ];
    }
}


