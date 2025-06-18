<?php

namespace Modules\Settings\Listeners;

use Modules\Settings\Events\SettingCreated;
use Modules\Settings\Events\SettingUpdated;
use Modules\Settings\Events\SettingDeleted;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class LogSettingChange
{
    /**
     * Create the event listener.
     *
     * @return void;
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the setting created event.
     *
     * @param  \Modules\Settings\Events\SettingCreated  $event
     * @return void;
     */
    public function handleSettingCreated(SettingCreated $event)
    {
        $this->logSettingChange('created', $event->setting);
    }

    /**
     * Handle the setting updated event.
     *
     * @param  \Modules\Settings\Events\SettingUpdated  $event
     * @return void;
     */
    public function handleSettingUpdated(SettingUpdated $event)
    {
        $this->logSettingChange('updated', $event->setting);
    }

    /**
     * Handle the setting deleted event.
     *
     * @param  \Modules\Settings\Events\SettingDeleted  $event
     * @return void;
     */
    public function handleSettingDeleted(SettingDeleted $event)
    {
        $this->logSettingChange('deleted', $event->setting);
    }

    /**
     * Log the setting change.
     *
     * @param  string  $action
     * @param  \Modules\Settings\Domain\Models\Setting  $setting
     * @return void;
     */
    protected function logSettingChange(string $action, $setting)
    {
        $user = Auth::user();
        $userId = $user ? $user->id : 'system';

        Log::info("Setting {$action} by {$userId}: {$setting->group}.{$setting->key} = " . json_encode($setting->value));
    }
}


