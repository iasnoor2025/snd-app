<?php

namespace Modules\Core\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Route;

class CoreServiceProvider extends ServiceProvider
{
    /**
     * The module name.
     *
     * @var string
     */
    protected $moduleName = 'Core';

    /**
     * Register services.
     *
     * @return void
     */
    public function register()
    {
        $this->app->register(RouteServiceProvider::class);

        // Only register interfaces and implementations if they exist
        if (class_exists('Modules\Core\Repositories\BaseRepositoryInterface') &&
            class_exists('Modules\Core\Repositories\BaseRepository')) {
            $this->app->bind(
                'Modules\Core\Repositories\BaseRepositoryInterface',
                'Modules\Core\Repositories\BaseRepository'
            );
        }

        // Check if the EventServiceProvider exists and register it
        if (file_exists(module_path($this->moduleName, 'Providers/EventServiceProvider.php'))) {
            $this->app->register(EventServiceProvider::class);
        }

        // Register event handlers if they exist
        if (class_exists('Modules\Core\Services\BaseEventHandler') &&
            class_exists('Modules\Core\Services\CoreEventHandler')) {
            $this->app->singleton(
                'Modules\Core\Services\BaseEventHandler',
                'Modules\Core\Services\CoreEventHandler'
            );
        }

        // Register legacy code handler if it exists
        if (class_exists('Modules\Core\Services\LegacyCodeHandler')) {
            $this->app->singleton('Modules\Core\Services\LegacyCodeHandler', function ($app) {
                return new \Modules\Core\Services\LegacyCodeHandler();
            });
        }
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

        // Load migrations only if they exist
        $migrationsPath = module_path('Core', 'Database/Migrations');
        if (is_dir($migrationsPath)) {
            $this->loadMigrationsFrom($migrationsPath);
        }

        // Register event subscribers if the class exists
        if (class_exists('Modules\Core\Services\CoreEventHandler')) {
            try {
                Event::subscribe($this->app->make('Modules\Core\Services\CoreEventHandler'));
            } catch (\Exception $e) {
                // Silently fail if event handler can't be resolved
            }
        }

        // Register routes if route files exist
        $this->registerRoutes();

        // Register middleware if it exists
        $this->registerMiddleware();

        // Register observers
        $this->registerObservers();
    }

    /**
     * Register routes.
     *
     * @return void
     */
    protected function registerRoutes()
    {
        $webRoutePath = module_path('Core', 'Routes/web.php');
        $apiRoutePath = module_path('Core', 'Routes/api.php');

        if (file_exists($webRoutePath)) {
            Route::middleware('web')->group($webRoutePath);
        }

        if (file_exists($apiRoutePath)) {
            Route::middleware('api')->group($apiRoutePath);
        }
    }

    /**
     * Register middleware.
     *
     * @return void
     */
    protected function registerMiddleware()
    {
        if (class_exists('Modules\Core\Http\Middleware\BaseMiddleware')) {
            $this->app['router']->aliasMiddleware('core', \Modules\Core\Http\Middleware\BaseMiddleware::class);
        }
    }

    /**
     * Register config.
     *
     * @return void
     */
    protected function registerConfig()
    {
        $configPath = module_path('Core', 'Config/config.php');

        if (file_exists($configPath)) {
            $this->publishes([
                $configPath => config_path('core.php')
            ], 'config');
            $this->mergeConfigFrom($configPath, 'core');
        }
    }

    /**
     * Register views.
     *
     * @return void
     */
    protected function registerViews()
    {
        $viewPath = resource_path('views/modules/core');
        $sourcePath = module_path('Core', 'Resources/views');

        if (is_dir($sourcePath)) {
            $this->publishes([
                $sourcePath => $viewPath
            ],'views');

            $this->loadViewsFrom(array_merge(array_map(function ($path) {
                return $path . '/modules/core';
            }, \Config::get('view.paths')), [$sourcePath]), 'core');
        }
    }

    /**
     * Register translations.
     *
     * @return void
     */
    protected function registerTranslations()
    {
        $langPath = resource_path('lang/modules/core');

        if (is_dir($langPath)) {
            $this->loadTranslationsFrom($langPath, 'core');
        } else {
            $sourcePath = module_path('Core', 'Resources/lang');
            if (is_dir($sourcePath)) {
                $this->loadTranslationsFrom($sourcePath, 'core');
            }
        }
    }

    /**
     * Register observers.
     *
     * @return void
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

    /**
     * Get the services provided by the provider.
     *
     * @return array
     */
    public function provides()
    {
        $provides = [];

        if (class_exists('Modules\Core\Repositories\BaseRepositoryInterface')) {
            $provides[] = 'Modules\Core\Repositories\BaseRepositoryInterface';
        }

        if (class_exists('Modules\Core\Services\BaseEventHandler')) {
            $provides[] = 'Modules\Core\Services\BaseEventHandler';
        }

        if (class_exists('Modules\Core\Services\CoreEventHandler')) {
            $provides[] = 'Modules\Core\Services\CoreEventHandler';
        }

        if (class_exists('Modules\Core\Services\LegacyCodeHandler')) {
            $provides[] = 'Modules\Core\Services\LegacyCodeHandler';
        }

        return $provides;
    }
}


