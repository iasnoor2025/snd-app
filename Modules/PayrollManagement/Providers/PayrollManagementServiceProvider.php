<?php

namespace Modules\PayrollManagement\Providers;

use Illuminate\Support\ServiceProvider;

class PayrollManagementServiceProvider extends ServiceProvider
{
    public function boot()
    {
        $this->loadMigrationsFrom(__DIR__ . '/../database/migrations');
        $this->app->register(\Modules\PayrollManagement\Providers\RouteServiceProvider::class);
    }
}
