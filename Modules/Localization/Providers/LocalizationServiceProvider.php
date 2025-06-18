<?php

namespace Modules\Localization\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Database\Eloquent\Factory;

class LocalizationServiceProvider extends ServiceProvider
{
    /**
     * @var string $moduleName
     */
    protected $moduleName = 'Localization';

    /**
     * @var string $moduleNameLower
     */
    protected $moduleNameLower = 'localization';

    /**
     * Boot the application events.
     */
    public function boot(): void
    {
        $this->registerTranslations();
        $this->registerConfig();
        $this->registerViews();
        $this->loadMigrationsFrom(module_path($this->moduleName, 'Database/Migrations'));
        $this->registerMiddleware();
        $this->registerCommands();

        $this->loadRoutesFrom(module_path($this->moduleName, 'Routes/web.php'));
        $this->loadRoutesFrom(module_path($this->moduleName, 'Routes/public.php'));

        // Register observers
        $this->registerObservers();
    }

    /**
     * Register the service provider.
     */
    public function register(): void
    {
        $this->app->register(RouteServiceProvider::class);

        // Register services
        $this->app->singleton('localization.helper', function ($app) {
            return new \Modules\Localization\Helpers\LocalizationHelper();
        });

        $this->app->singleton('localization.translation', function ($app) {
            return new \Modules\Localization\Services\TranslationService();
        });

        $this->app->singleton(\Modules\Localization\Services\SpatieTranslatableService::class);

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
     * Register middleware
     */
    protected function registerMiddleware(): void
    {
        $router = $this->app['router'];

        $router->aliasMiddleware('localization', \Modules\Localization\Http\Middleware\LocalizationMiddleware::class);

        // Add to web middleware group
        $router->pushMiddlewareToGroup('web', \Modules\Localization\Http\Middleware\LocalizationMiddleware::class);
    }

    /**
     * Register console commands
     */
    protected function registerCommands(): void
    {
        // Register any console commands here if needed
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

        $this->loadViewsFrom(array_merge(array_map(function ($path) {
            return $path . '/modules/' . $this->moduleNameLower;
        }, \Config::get('view.paths')), [$sourcePath]), $this->moduleNameLower);
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
            $this->loadJsonTranslationsFrom($langPath);
        } else {
            $this->loadTranslationsFrom(module_path($this->moduleName, 'resources/lang'), $this->moduleNameLower);
            $this->loadJsonTranslationsFrom(module_path($this->moduleName, 'resources/lang'));
        }
    }

    /**
     * Get the services provided by the provider.
     *
     * @return array;
     */
        /**
     * Register observers.
     *
     * @return void;
     */
    protected function registerObservers()
    {
        // Register observers here based on files in Observers directory
        $observersPath = module_path($this->moduleName, 'Observers');

        if (is_dir($observersPath)) {
            $files = glob("$observersPath/*.php");

            foreach ($files as $file) {
                $observerClass = 'Modules\\' . $this->moduleName . '\\Observers\\' . pathinfo($file, PATHINFO_FILENAME);
                $modelClass = 'Modules\\' . $this->moduleName . '\\Domain\Models\\' . str_replace('Observer', '', pathinfo($file, PATHINFO_FILENAME));

                if (class_exists($observerClass) && class_exists($modelClass)) {
                    $modelClass::observe($observerClass);
                }
            }
        }
    }

public function provides()
    {
        return [];
    }
}


