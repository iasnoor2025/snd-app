<?php

namespace Modules\SafetyManagement\Providers;

use Illuminate\Support\ServiceProvider;

class SafetyManagementServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     *
     * @return void
     */
    public function register(): void
    {
        // Register bindings, if any
    }

    /**
     * Bootstrap services.
     *
     * @return void
     */
    public function boot(): void
    {
        if ($this->app->runningInConsole()) {
            $this->loadMigrationsFrom(__DIR__.'/../database/migrations');
            $this->publishes([
                __DIR__.'/../database/factories' => database_path('factories'),
            ], 'factories');
        }
        $this->loadRoutesFrom(__DIR__.'/../Routes/web.php');
        $this->loadRoutesFrom(__DIR__.'/../Routes/api.php');
        $this->loadTranslationsFrom(__DIR__.'/../Resources/lang', 'SafetyManagement');
        $this->loadViewsFrom(__DIR__.'/../Resources/views', 'SafetyManagement');
    }
}
