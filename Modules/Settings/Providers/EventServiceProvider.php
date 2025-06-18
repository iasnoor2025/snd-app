<?php

namespace Modules\Settings\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Modules\Settings\Events\SettingCreated;
use Modules\Settings\Events\SettingUpdated;
use Modules\Settings\Events\SettingDeleted;
use Modules\Settings\Listeners\LogSettingChange;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The module name.
     *
     * @var string
     */
    protected $moduleName = 'Settings';

    /**
     * The event listener mappings for the application.
     *
     * @var array<string, array<int, string>>
     */
    protected $listen = [
        SettingCreated::class => [
            LogSettingChange::class . '@handleSettingCreated'
        ],
        SettingUpdated::class => [
            LogSettingChange::class . '@handleSettingUpdated'
        ],
        SettingDeleted::class => [
            LogSettingChange::class . '@handleSettingDeleted'
        ]
    ];

    /**
     * Register any events for your application.
     *
     * @return void
     */
    public function boot()
    {
        parent::boot();
    }
}




