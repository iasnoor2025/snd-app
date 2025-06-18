<?php

namespace Modules\Settings\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Event;
use Modules\Settings\Domain\Models\Setting;
use Modules\Settings\Observers\SettingObserver;
use Modules\Settings\Providers\EventServiceProvider;
use Modules\Settings\Providers\RouteServiceProvider;
use Modules\Settings\Services\SettingService;

class SettingsServiceProvider extends ServiceProvider
{
    /**
     * @var string $moduleName
     */
    protected $moduleName = 'Settings';

    /**
     * @var string $moduleNameLower
     */
    protected $moduleNameLower = 'settings';

    /**
     * Register services.
     *
     * @return void
     */
    public function register()
    {
        // Register the EventServiceProvider
        $this->app->register(EventServiceProvider::class);

        // Register the RouteServiceProvider
        $this->app->register(RouteServiceProvider::class);

        // Register bindings
        $this->registerRepositories();

        // Register services
        $this->registerServices();

        // Load helper files
        $this->loadHelpers();
    }

    /**
     * Bootstrap services.
     *
     * @return void
     */
    public function boot()
    {
        $this->registerTranslations();
        $this->registerConfig();
        $this->registerViews();
        $this->loadMigrationsFrom(module_path('Settings', 'Database/Migrations'));

        // Register Observers
        $this->registerObservers();
    }

    /**
     * Register repositories.
     *
     * @return void
     */
    protected function registerRepositories()
    {
        $this->app->bind(
            \Modules\Settings\Repositories\Interfaces\SettingRepositoryInterface::class,
            \Modules\Settings\Repositories\SettingRepository::class
        );
    }

    /**
     * Register services.
     *
     * @return void
     */
    protected function registerServices()
    {
        $this->app->singleton(SettingService::class, function ($app) {
            return new SettingService(
                $app->make(\Modules\Settings\Repositories\Interfaces\SettingRepositoryInterface::class)
            );
        });

        // Register the facade accessor
        $this->app->alias(SettingService::class, 'settings.service');
    }

    /**
     * Register observers.
     *
     * @return void
     */
    protected function registerObservers()
    {
        Setting::observe(SettingObserver::class);
    }

    /**
     * Register config.
     *
     * @return void
     */
    protected function registerConfig()
    {
        $this->publishes([
            module_path('Settings', 'Config/config.php') => config_path('settings.php')
        ], 'config');
        $this->mergeConfigFrom(
            module_path('Settings', 'Config/config.php'), 'settings'
        );
    }

    /**
     * Register views.
     *
     * @return void
     */
    protected function registerViews()
    {
        $viewPath = resource_path('views/modules/settings');

        $sourcePath = module_path('Settings', 'Resources/views');

        $this->publishes([
            $sourcePath => $viewPath
        ], 'views');

        $this->loadViewsFrom(array_merge(array_map(function ($path) {
            return $path . '/modules/settings';
        }, \Config::get('view.paths')), [$sourcePath]), 'settings');
    }

    /**
     * Register translations.
     *
     * @return void
     */
    protected function registerTranslations()
    {
        $langPath = resource_path('lang/modules/settings');

        if (is_dir($langPath)) {
            $this->loadTranslationsFrom($langPath, 'settings');
        } else {
            $this->loadTranslationsFrom(module_path('Settings', 'Resources/lang'), 'settings');
        }
    }

    /**
     * Load helper files.
     *
     * @return void
     */
    protected function loadHelpers()
    {
        // Include helper file
        $helperFile = module_path($this->moduleName, 'Helpers/settings.php');

        if (file_exists($helperFile)) {
            require_once $helperFile;
        }
    }

    /**
     * Get the services provided by the provider.
     *
     * @return array
     */
    public function provides()
    {
        return [
            \Modules\Settings\Repositories\Interfaces\SettingRepositoryInterface::class,
            \Modules\Settings\Services\SettingService::class,
        ];
    }
}


