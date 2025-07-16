<?php

namespace Modules\TimesheetManagement\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Route;
use Illuminate\Database\Eloquent\Factory;
use Modules\TimesheetManagement\Domain\Models\Timesheet;
use Modules\TimesheetManagement\Policies\TimesheetPolicy;

class TimesheetManagementServiceProvider extends ServiceProvider
{
    /**
     * @var string $moduleName
     */
    protected $moduleName = 'TimesheetManagement';

    /**
     * @var string $moduleNameLower
     */
    protected $moduleNameLower = 'timesheetmanagement';

    /**
     * Boot the application events.
     *
     * @return void
     */
    public function boot()
    {
        $this->loadViewsFrom(__DIR__ . '/../resources/views', 'TimesheetManagement');
        $this->registerTranslations();
        $this->registerConfig();
        $this->registerViews();
        $this->loadMigrationsFrom(module_path($this->moduleName, 'Database/Migrations'));

        // Register observers
        $this->registerObservers();

        // Register policies
        $this->registerPolicies();
    }

    /**
     * Register the service provider.
     *
     * @return void
     */
    public function register()
    {
        $this->commands([
            \Modules\TimesheetManagement\Console\Commands\AutoGenerateTimesheets::class,
        ]);
        $this->app->register(RouteServiceProvider::class);
        $this->app->register(EventServiceProvider::class);
    }

    /**
     * Register config.
     *
     * @return void
     */
    protected function registerConfig()
    {
        $this->publishes([
            module_path($this->moduleName, 'Config/config.php') => config_path($this->moduleNameLower . '.php')
        ], 'config');
        $this->mergeConfigFrom(
            module_path($this->moduleName, 'Config/config.php'), $this->moduleNameLower
        );
    }

    /**
     * Register views.
     *
     * @return void
     */
    protected function registerViews()
    {
        $viewPath = resource_path('views/modules/' . $this->moduleNameLower);

        $sourcePath = module_path($this->moduleName, 'Resources/views');

        $this->publishes([
            $sourcePath => $viewPath
        ], ['views', $this->moduleNameLower . '-module-views']);

        $this->loadViewsFrom(array_merge(array_map(function ($path) {
            return $path . '/modules/' . $this->moduleNameLower;
        }, \Config::get('view.paths')), [$sourcePath]), $this->moduleNameLower);
    }

    /**
     * Register translations.
     *
     * @return void
     */
    protected function registerTranslations()
    {
        $langPath = resource_path('lang/modules/' . $this->moduleNameLower);

        if (is_dir($langPath)) {
            $this->loadTranslationsFrom($langPath, $this->moduleNameLower);
        } else {
            $this->loadTranslationsFrom(module_path($this->moduleName, 'Resources/lang'), $this->moduleNameLower);
        }
    }

    /**
     * Register model observers.
     *
     * @return void
     */
    protected function registerObservers()
    {
        // No observers to register
    }

    /**
     * Register policies.
     *
     * @return void
     */
    protected function registerPolicies()
    {
        Gate::policy(Timesheet::class, TimesheetPolicy::class);
    }

    /**
     * Get the services provided by the provider.
     *
     * @return array
     */
    public function provides()
    {
        return [];
    }
}


