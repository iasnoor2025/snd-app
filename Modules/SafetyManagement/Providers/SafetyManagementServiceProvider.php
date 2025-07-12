<?php

namespace Modules\SafetyManagement\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Gate;
use Modules\SafetyManagement\Domain\Models\Incident;
use Modules\SafetyManagement\Domain\Models\Inspection;
use Modules\SafetyManagement\Policies\IncidentPolicy;
use Modules\SafetyManagement\Policies\InspectionPolicy;

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

        Gate::policy(Incident::class, IncidentPolicy::class);
        Gate::policy(Inspection::class, InspectionPolicy::class);
    }
}
