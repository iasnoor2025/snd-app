<?php

namespace Modules\Settings\Observers;

use Modules\Settings\Domain\Models\Setting;
use Modules\Settings\Events\SettingCreated;
use Modules\Settings\Events\SettingUpdated;
use Modules\Settings\Events\SettingDeleted;
use Illuminate\Support\Facades\Cache;

class SettingObserver
{
    /**
     * Handle the Setting "created" event.
     *
     * @param  \Modules\Settings\Domain\Models\Setting  $setting
     * @return void;
     */
    public function created(Setting $setting)
    {
        // Clear the settings cache
        $this->clearCache();

        // Dispatch the created event
        event(new SettingCreated($setting));
    }

    /**
     * Handle the Setting "updated" event.
     *
     * @param  \Modules\Settings\Domain\Models\Setting  $setting
     * @return void;
     */
    public function updated(Setting $setting)
    {
        // Clear the settings cache
        $this->clearCache();

        // Dispatch the updated event
        event(new SettingUpdated($setting));
    }

    /**
     * Handle the Setting "deleted" event.
     *
     * @param  \Modules\Settings\Domain\Models\Setting  $setting
     * @return void;
     */
    public function deleted(Setting $setting)
    {
        // Clear the settings cache
        $this->clearCache();

        // Dispatch the deleted event
        event(new SettingDeleted($setting));
    }

    /**
     * Handle the Setting "restored" event.
     *
     * @param  \Modules\Settings\Domain\Models\Setting  $setting
     * @return void;
     */
    public function restored(Setting $setting)
    {
        // Clear the settings cache
        $this->clearCache();
    }

    /**
     * Handle the Setting "force deleted" event.
     *
     * @param  \Modules\Settings\Domain\Models\Setting  $setting
     * @return void;
     */
    public function forceDeleted(Setting $setting)
    {
        // Clear the settings cache
        $this->clearCache();
    }

    /**
     * Clear the settings cache.
     *
     * @return void;
     */
    protected function clearCache()
    {
        Cache::forget('settings');
        Cache::forget('settings.groups');
    }
}


