<?php

namespace Modules\Settings\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Modules\Settings\Services\SettingService;
use Inertia\Inertia;

class NotificationSettingsController extends Controller
{
    protected $settingService;

    public function __construct(SettingService $settingService)
    {
        $this->settingService = $settingService;
    }

    public function index()
    {
        // Get notification settings from database
        $notificationSettings = $this->settingService->getSettingsByGroup('notifications');

        // Convert to key-value array
        $settings = [];
        foreach ($notificationSettings as $setting) {
            $settings[$setting->key] = $setting->value === 'true' || $setting->value === true;
        }

        // Set default values for missing settings
        $defaultSettings = [
            'email_notifications' => true,
            'sms_notifications' => false,
            'push_notifications' => true,
            'leave_request_notifications' => true,
            'timesheet_notifications' => true,
            'payroll_notifications' => true,
            'project_notifications' => true,
            'equipment_notifications' => true,
            'rental_notifications' => true,
            'maintenance_notifications' => true,
            'overdue_notifications' => true,
            'payment_notifications' => true,
            'system_notifications' => true,
            'marketing_notifications' => false,
        ];

        $settings = array_merge($defaultSettings, $settings);

        return Inertia::render('Settings/Notifications', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'email_notifications' => 'boolean',
            'sms_notifications' => 'boolean',
            'push_notifications' => 'boolean',
            'leave_request_notifications' => 'boolean',
            'timesheet_notifications' => 'boolean',
            'payroll_notifications' => 'boolean',
            'project_notifications' => 'boolean',
            'equipment_notifications' => 'boolean',
            'rental_notifications' => 'boolean',
            'maintenance_notifications' => 'boolean',
            'overdue_notifications' => 'boolean',
            'payment_notifications' => 'boolean',
            'system_notifications' => 'boolean',
            'marketing_notifications' => 'boolean',
        ]);

        // Update notification settings
        $notificationSettings = [
            'email_notifications' => $request->boolean('email_notifications'),
            'sms_notifications' => $request->boolean('sms_notifications'),
            'push_notifications' => $request->boolean('push_notifications'),
            'leave_request_notifications' => $request->boolean('leave_request_notifications'),
            'timesheet_notifications' => $request->boolean('timesheet_notifications'),
            'payroll_notifications' => $request->boolean('payroll_notifications'),
            'project_notifications' => $request->boolean('project_notifications'),
            'equipment_notifications' => $request->boolean('equipment_notifications'),
            'rental_notifications' => $request->boolean('rental_notifications'),
            'maintenance_notifications' => $request->boolean('maintenance_notifications'),
            'overdue_notifications' => $request->boolean('overdue_notifications'),
            'payment_notifications' => $request->boolean('payment_notifications'),
            'system_notifications' => $request->boolean('system_notifications'),
            'marketing_notifications' => $request->boolean('marketing_notifications'),
        ];

        foreach ($notificationSettings as $key => $value) {
            $this->settingService->updateSetting($key, $value, 'notifications');
        }

        return redirect()->back()->with('success', 'Notification settings updated successfully.');
    }
}
