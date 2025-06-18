<?php

namespace Modules\TimesheetManagement\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Modules\TimesheetManagement\Events\GeofenceViolationDetected;
use Modules\TimesheetManagement\Listeners\HandleGeofenceViolation;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event listener mappings for the application.
     *
     * @var array
     */
    protected $listen = [
        GeofenceViolationDetected::class => [
            HandleGeofenceViolation::class,
        ],
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




