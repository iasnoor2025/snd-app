<?php

namespace Modules\TimesheetManagement\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Modules\TimesheetManagement\Services\GeofencingService;
use Modules\TimesheetManagement\Events\GeofenceViolationDetected;
use Modules\TimesheetManagement\Listeners\HandleGeofenceViolation;
use Modules\TimesheetManagement\Console\Commands\CleanupGeofenceData;
use Modules\TimesheetManagement\Console\Commands\ProcessOfflineTimesheets;

class GeofencingServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Register the main geofencing service
        $this->app->singleton(GeofencingService::class, function ($app) {
            return new GeofencingService();
        });

        // Register configuration
        $this->mergeConfigFrom(
            module_path('TimesheetManagement', 'config/mobile_geofencing.php'),
            'mobile_geofencing'
        );

        // Register console commands
        if ($this->app->runningInConsole()) {
            $this->commands([
                CleanupGeofenceData::class,
                ProcessOfflineTimesheets::class,
            ]);
        }
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Register event listeners
        $this->registerEventListeners();

        // Register policies
        $this->registerPolicies();

        // Register middleware
        $this->registerMiddleware();

        // Publish configuration
        $this->publishes([
            module_path('TimesheetManagement', 'config/mobile_geofencing.php') => config_path('mobile_geofencing.php'),
        ], 'geofencing-config');

        // Publish migrations
        $this->publishes([
            module_path('TimesheetManagement', 'Database/Migrations') => database_path('migrations'),
        ], 'geofencing-migrations');

        // Load views
        $this->loadViewsFrom(module_path('TimesheetManagement', 'Resources/views'), 'timesheet');

        // Load translations
        $this->loadTranslationsFrom(module_path('TimesheetManagement', 'Resources/lang'), 'timesheet');
    }

    /**
     * Register event listeners.
     */
    protected function registerEventListeners(): void
    {
        Event::listen(
            GeofenceViolationDetected::class,
            HandleGeofenceViolation::class
        );
    }

    /**
     * Register authorization policies.
     */
    protected function registerPolicies(): void
    {
        Gate::define('manage-geofence-zones', function ($user) {
            return $user->hasPermission('manage_geofence_zones') ||
                   $user->hasRole(['admin', 'hr_manager', 'project_manager']);
        });

        Gate::define('view-geofence-violations', function ($user) {
            return $user->hasPermission('view_geofence_violations') ||
                   $user->hasRole(['admin', 'hr_manager', 'project_manager']);
        });

        Gate::define('manage-geofence-violations', function ($user) {
            return $user->hasPermission('manage_geofence_violations') ||
                   $user->hasRole(['admin', 'hr_manager']);
        });

        Gate::define('view-geofence-reports', function ($user) {
            return $user->hasPermission('view_geofence_reports') ||
                   $user->hasRole(['admin', 'hr_manager', 'project_manager']);
        });

        Gate::define('export-geofence-data', function ($user) {
            return $user->hasPermission('export_geofence_data') ||
                   $user->hasRole(['admin', 'hr_manager']);
        });

        Gate::define('configure-geofencing', function ($user) {
            return $user->hasPermission('configure_geofencing') ||
                   $user->hasRole(['admin']);
        });

        Gate::define('view-employee-location', function ($user, $employee = null) {
            // Users can view their own location
            if ($employee && $user->id === $employee->id) {
                return true;
            }

            // Managers can view their team's locations
            if ($employee && $user->hasRole(['project_manager', 'team_lead'])) {
                return $user->managesEmployee($employee);
            }

            // HR and admins can view all locations
            return $user->hasRole(['admin', 'hr_manager']);
        });
    }

    /**
     * Register middleware.
     */
    protected function registerMiddleware(): void
    {
        $router = $this->app['router'];

        // Register geofencing middleware
        $router->aliasMiddleware('geofence.check', \Modules\TimesheetManagement\Http\Middleware\GeofenceCheck::class);
        $router->aliasMiddleware('geofence.verify', \Modules\TimesheetManagement\Http\Middleware\GeofenceVerify::class);
        $router->aliasMiddleware('mobile.auth', \Modules\TimesheetManagement\Http\Middleware\MobileAuth::class);
    }

    /**
     * Get the services provided by the provider.
     */
    public function provides(): array
    {
        return [
            GeofencingService::class,
        ];
    }
}
