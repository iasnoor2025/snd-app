<?php

namespace Modules\LeaveManagement\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Modules\LeaveManagement\Http\Requests\LeaveSettingRequest;

class LeaveSettingController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:leave-settings.view')->only(['index']);
        $this->middleware('permission:leave-settings.edit')->only(['update']);
    }

    /**
     * Display leave management settings.
     */
    public function index()
    {
        $settings = $this->getLeaveSettings();

        return Inertia::render('LeaveManagement/Settings/Index', [
            'settings' => $settings,
        ]);
    }

    /**
     * Update leave management settings.
     */
    public function update(LeaveSettingRequest $request)
    {
        try {
            DB::beginTransaction();

            $settings = $request->validated();

            foreach ($settings as $key => $value) {
                $this->updateSetting($key, $value);
            }

            // Clear settings cache
            Cache::forget('leave_settings');

            DB::commit();

            return back()->with('success', 'Leave settings updated successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating leave settings: ' . $e->getMessage());

            return back()
                ->withInput()
                ->with('error', 'Failed to update leave settings. Please try again.');
        }
    }

    /**
     * Get all leave settings with defaults.
     */
    private function getLeaveSettings(): array
    {
        return Cache::remember('leave_settings', 3600, function () {
            $defaultSettings = [
                // General Settings
                'leave_year_start_month' => 1, // January
                'leave_year_start_day' => 1,
                'weekend_days' => ['friday', 'saturday'], // Default weekend
                'public_holidays_affect_leave' => true,
                'allow_half_day_leave' => true,
                'allow_negative_balance' => false,
                'max_negative_balance_days' => 0,

                // Approval Settings
                'auto_approve_sick_leave' => false,
                'require_medical_certificate_days' => 3,
                'max_consecutive_days_without_approval' => 3,
                'approval_hierarchy_levels' => 2,
                'escalation_days' => 3,

                // Carry Forward Settings
                'global_carry_forward_enabled' => true,
                'carry_forward_deadline_month' => 3, // March
                'carry_forward_deadline_day' => 31,
                'max_carry_forward_percentage' => 25, // 25% of annual entitlement
                'carry_forward_expiry_months' => 12,

                // Notification Settings
                'notify_employee_on_approval' => true,
                'notify_employee_on_rejection' => true,
                'notify_manager_on_request' => true,
                'notify_hr_on_long_leave' => true,
                'long_leave_threshold_days' => 10,
                'reminder_days_before_expiry' => [30, 7],

                // Probation Settings
                'probation_leave_allowed' => false,
                'probation_period_months' => 6,
                'probation_leave_types' => ['sick', 'emergency'],

                // Advanced Settings
                'leave_encashment_enabled' => false,
                'encashment_percentage' => 50,
                'min_encashment_days' => 5,
                'max_encashment_days' => 15,
                'leave_calendar_integration' => false,
                'employee_self_cancel_hours' => 24,
                'manager_override_balance' => true,
            ];

            $settings = [];
            foreach ($defaultSettings as $key => $defaultValue) {
                $settings[$key] = $this->getSetting($key, $defaultValue);
            }

            return $settings;
        });
    }

    /**
     * Get a specific setting value.
     */
    private function getSetting(string $key, $default = null)
    {
        try {
            $setting = DB::table('settings')
                ->where('key', "leave.{$key}")
                ->first();

            if (!$setting) {
                return $default;
            }

            // Handle different data types
            $value = $setting->value;

            // Try to decode JSON for arrays/objects
            $decoded = json_decode($value, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                return $decoded;
            }

            // Handle boolean strings
            if ($value === 'true') return true;
            if ($value === 'false') return false;

            // Handle numeric strings
            if (is_numeric($value)) {
                return strpos($value, '.') !== false ? (float) $value : (int) $value;
            }

            return $value;

        } catch (\Exception $e) {
            Log::warning("Failed to get setting {$key}: " . $e->getMessage());
            return $default;
        }
    }

    /**
     * Update a specific setting value.
     */
    private function updateSetting(string $key, $value): void
    {
        $settingKey = "leave.{$key}";

        // Convert value to string for storage
        if (is_array($value) || is_object($value)) {
            $value = json_encode($value);
        } elseif (is_bool($value)) {
            $value = $value ? 'true' : 'false';
        } else {
            $value = (string) $value;
        }

        DB::table('settings')->updateOrInsert(
            ['key' => $settingKey],
            [
                'value' => $value,
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );
    }

    /**
     * Reset settings to defaults.
     */
    public function reset()
    {
        try {
            DB::beginTransaction();

            // Delete all leave settings
            DB::table('settings')
                ->where('key', 'like', 'leave.%')
                ->delete();

            // Clear cache
            Cache::forget('leave_settings');

            DB::commit();

            return back()->with('success', 'Leave settings reset to defaults successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error resetting leave settings: ' . $e->getMessage());

            return back()->with('error', 'Failed to reset leave settings. Please try again.');
        }
    }

    /**
     * Export settings as JSON.
     */
    public function export()
    {
        try {
            $settings = $this->getLeaveSettings();

            $filename = 'leave_settings_' . date('Y-m-d_H-i-s') . '.json';

            return response()->json($settings)
                ->header('Content-Disposition', "attachment; filename={$filename}");

        } catch (\Exception $e) {
            Log::error('Error exporting leave settings: ' . $e->getMessage());

            return back()->with('error', 'Failed to export leave settings.');
        }
    }

    /**
     * Import settings from JSON.
     */
    public function import(Request $request)
    {
        $request->validate([
            'settings_file' => 'required|file|mimes:json|max:1024', // 1MB max
        ]);

        try {
            DB::beginTransaction();

            $file = $request->file('settings_file');
            $content = file_get_contents($file->getPathname());
            $settings = json_decode($content, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new \Exception('Invalid JSON file format.');
            }

            // Validate and update settings
            foreach ($settings as $key => $value) {
                $this->updateSetting($key, $value);
            }

            // Clear cache
            Cache::forget('leave_settings');

            DB::commit();

            return back()->with('success', 'Leave settings imported successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error importing leave settings: ' . $e->getMessage());

            return back()->with('error', 'Failed to import leave settings: ' . $e->getMessage());
        }
    }
}
