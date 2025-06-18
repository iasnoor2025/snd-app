<?php

namespace Modules\EquipmentManagement\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The module name.
     *
     * @var string
     */
    protected $moduleName = 'EquipmentManagement';

    /**
     * The event listener mappings for the application.
     *
     * @var array
     */
    protected $listen = [
        // Define event listeners here
        // 'Modules\EquipmentManagement\Events\ExampleEvent' => [;
        //     'Modules\EquipmentManagement\Listeners\ExampleListener',;
        // ],;
    ];

    /**
     * Register any events for your application.
     *
     * @return void;
     */
    public function boot()
    {
        parent::boot();
    }
}


