<?php

use Modules\Settings\Facades\Setting;

if (!function_exists('setting')) {
    /**
     * Get or set a setting value.
     *
     * @param string|array|null $key
     * @param mixed $default
     * @param string|null $group
     * @return mixed
     */
    function setting($key = null, $default = null, $group = null)
    {
        // If no key is provided, return the service instance
        if (is_null($key)) {
            return app('settings.service');
        }

        // If key is an array, set the settings
        if (is_array($key)) {
            foreach ($key as $k => $value) {
                Setting::set($k, $value, $group);
            }
            return true;
        }

        // Get the setting value
        return Setting::get($key, $default, $group);
    }
}

if (!function_exists('settings_group')) {
    /**
     * Get all settings from a specific group.
     *
     * @param string $group
     * @return \Illuminate\Support\Collection
     */
    function settings_group($group)
    {
        return Setting::getSettingsByGroup($group);
    }
}


