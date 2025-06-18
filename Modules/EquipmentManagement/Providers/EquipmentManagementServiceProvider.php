<?php

namespace Modules\EquipmentManagement\Providers;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Illuminate\Database\Eloquent\Factory;

class EquipmentManagementServiceProvider extends ServiceProvider
{
    /**
     * @var string $moduleName
     */
    protected $moduleName = 'EquipmentManagement';

    /**
     * @var string $moduleNameLower
     */
    protected $moduleNameLower = 'equipmentmanagement';

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
        $this->registerObservers();
        $this->registerEvents();
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
            module_path($this->moduleName, 'config/config.php') => config_path($this->moduleNameLower . '.php')
        ], 'config');
        $this->mergeConfigFrom(
            module_path($this->moduleName, 'config/config.php'), $this->moduleNameLower
        );
    }

    /**
     * Register views.
     *
     * @return void;
     */
    public function registerViews()
    {
        $viewPath = resource_path('views/modules/' . $this->moduleNameLower);

        $sourcePath = module_path($this->moduleName, 'resources/views');

        $this->publishes([
            $sourcePath => $viewPath
        ], ['views', $this->moduleNameLower . '-module-views']);

        $this->loadViewsFrom(array_merge($this->getPublishableViewPaths(), [$sourcePath]), $this->moduleNameLower);
    }

    /**
     * Register translations.
     *
     * @return void;
     */
    public function registerTranslations()
    {
        $langPath = resource_path('lang/modules/' . $this->moduleNameLower);

        if (is_dir($langPath)) {
            $this->loadTranslationsFrom($langPath, $this->moduleNameLower);
        } else {
            $this->loadTranslationsFrom(module_path($this->moduleName, 'resources/lang'), $this->moduleNameLower);
        }
    }

    /**
     * Register model observers.
     *
     * @return void;
     */
    public function registerObservers()
    {
        // Register model observers here
        // Example: Equipment::observe(EquipmentObserver::class);
    }

    /**
     * Register events and listeners.
     *
     * @return void;
     */
    public function registerEvents()
    {
        // Register events and listeners here
        // Example: $this->app['events']->listen(EquipmentCreatedEvent::class, NotifyAdminListener::class);
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

    private function getPublishableViewPaths(): array
    {
        $paths = [];
        foreach (\Config::get('view.paths') as $path) {
            if (is_dir($path . '/modules/' . $this->moduleNameLower)) {
                $paths[] = $path . '/modules/' . $this->moduleNameLower;
            }
        }
        return $paths;
    }
}


