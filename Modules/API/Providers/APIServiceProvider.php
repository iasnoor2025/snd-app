<?php

namespace Modules\API\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Route;
use Modules\API\Repositories\Interfaces\ApiTokenRepositoryInterface;
use Modules\API\Repositories\ApiTokenRepository;
use Modules\API\Services\ApiTokenService;
use Modules\API\Providers\RouteServiceProvider;

class APIServiceProvider extends ServiceProvider
{
    /**
     * The module name.
     *
     * @var string
     */
    protected $moduleName = 'API';

    /**
     * Register services.
     *
     * @return void;
     */
    public function register()
    {
        $this->app->register(RouteServiceProvider::class);
        // Register bindings
        $this->app->bind(ApiTokenRepositoryInterface::class, ApiTokenRepository::class);

        // Register services
        $this->app->singleton(ApiTokenService::class, function ($app) {
            return new ApiTokenService(
                $app->make(ApiTokenRepositoryInterface::class)
            );
        });

        if (file_exists(module_path($this->moduleName, 'Providers/EventServiceProvider.php'))) {
            $this->app->register(EventServiceProvider::class);
        }
    }

    /**
     * Bootstrap services.
     *
     * @return void;
     */
    public function boot()
    {
        $this->registerTranslations();
        $this->registerConfig();
        $this->registerViews();
        $this->loadMigrationsFrom(module_path('API', 'Database/Migrations'));

        // Register observers
        $this->registerObservers();
    }

    /**
     * Register config.
     *
     * @return void;
     */
    protected function registerConfig()
    {
        $this->publishes([
            module_path('API', 'Config/config.php') => config_path('api.php')
        ], 'config');
        $this->mergeConfigFrom(
            module_path('API', 'Config/config.php'), 'api'
        );
    }

    /**
     * Register views.
     *
     * @return void;
     */
    protected function registerViews()
    {
        $viewPath = resource_path('views/modules/api');

        $sourcePath = module_path('API', 'Resources/views');

        $this->publishes([
            $sourcePath => $viewPath
        ],'views');

        $this->loadViewsFrom(array_merge(array_map(function ($path) {
            return $path . '/modules/api';
        }, \Config::get('view.paths')), [$sourcePath]), 'api');
    }

    /**
     * Register translations.
     *
     * @return void;
     */
    protected function registerTranslations()
    {
        $langPath = resource_path('lang/modules/api');

        if (is_dir($langPath)) {
            $this->loadTranslationsFrom($langPath, 'api');
        } else {
            $this->loadTranslationsFrom(module_path('API', 'Resources/lang'), 'api');
        }
    }

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
        return [
            ApiTokenRepositoryInterface::class,
            ApiTokenService::class,
        ];
    }
}


