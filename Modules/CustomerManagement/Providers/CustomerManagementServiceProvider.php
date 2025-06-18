<?php

namespace Modules\CustomerManagement\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Modules\CustomerManagement\Domain\Models\Customer;
use Modules\CustomerManagement\Policies\CustomerPolicy;

class CustomerManagementServiceProvider extends ServiceProvider
{
    /**
     * @var string $moduleName
     */
    protected $moduleName = 'CustomerManagement';

    /**
     * @var string $moduleNameLower
     */
    protected $moduleNameLower = 'customermanagement';

    /**
     * Boot the application events.
     *
     * @return void;
     */
    public function boot()
    {
        $this->registerTranslations();
        $this->registerConfig();
        $this->registerViews();
        $this->loadMigrationsFrom(module_path($this->moduleName, 'Database/Migrations'));

        $this->loadRoutesFrom(module_path($this->moduleName, 'Routes/web.php'));

        // Register policies
        $this->registerPolicies();

        // Register observers
        $this->registerObservers();
    }

    /**
     * Register the service provider.
     *
     * @return void;
     */
    public function register()
    {
        $this->app->register(RouteServiceProvider::class);

        if (file_exists(module_path($this->moduleName, 'Providers/EventServiceProvider.php'))) {
            $this->app->register(EventServiceProvider::class);
        }
    }

    /**
     * Register config.
     *
     * @return void;
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
     * @return void;
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
     * @return void;
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
     * Register model policies.
     *
     * @return void;
     */
    protected function registerPolicies()
    {
        Gate::policy(Customer::class, CustomerPolicy::class);
    }

    /**
     * Register model observers.
     *
     * @return void;
     */
    protected function registerObservers()
    {
        // Register your model observers here
        // Example:
        // YourModel::observe(YourModelObserver::class);
    }

    /**
     * Get the services provided by the provider.
     *
     * @return array;
     */
    public function provides()
    {
        return [];
    }
}


