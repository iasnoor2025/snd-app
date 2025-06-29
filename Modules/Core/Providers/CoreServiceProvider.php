<?php

namespace Modules\Core\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Route;
use Modules\Core\Services\MfaService;
use Modules\Core\Services\ApiKeyService;
use Modules\Core\Http\Middleware\MfaVerification;
use Modules\Core\Http\Middleware\ApiKeyAuthentication;
use Laravel\Socialite\Facades\Socialite;

class CoreServiceProvider extends ServiceProvider
{
    /**
     * The module name.
     *
     * @var string
     */
    protected $moduleName = 'Core';

    /**
     * The module name in lowercase.
     *
     * @var string
     */
    protected $moduleNameLower = 'core';

    /**
     * Register services.
     *
     * @return void
     */
    public function register()
    {
        $this->app->register(RouteServiceProvider::class);
        $this->app->register(EventServiceProvider::class);
        $this->app->register(AuthServiceProvider::class);
        $this->app->register(ToastServiceProvider::class);

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

        // Register MFA service
        $this->app->singleton(MfaService::class, function ($app) {
            return new MfaService();
        });

        // Register API Key service
        $this->app->singleton(ApiKeyService::class, function ($app) {
            return new ApiKeyService();
        });

        // Register Socialite
        $this->app->register(\Laravel\Socialite\SocialiteServiceProvider::class);
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

        // Register MFA middleware
        $router = $this->app['router'];
        $router->aliasMiddleware('mfa', MfaVerification::class);
        $router->aliasMiddleware('api-key', ApiKeyAuthentication::class);
    }

    /**
     * Register routes.
     *
     * @return void
     */
    protected function registerRoutes()
    {
        // Routes are handled by RouteServiceProvider to avoid conflicts
        // Core routes are registered with proper prefixes in RouteServiceProvider
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
                $configPath => config_path($this->moduleNameLower . '.php')
            ], 'config');
            $this->mergeConfigFrom($configPath, $this->moduleNameLower);
        }
    }

    /**
     * Register views.
     *
     * @return void
     */
    protected function registerViews()
    {
        $viewPath = resource_path('views/modules/' . $this->moduleNameLower);
        $sourcePath = module_path('Core', 'Resources/views');

        if (is_dir($sourcePath)) {
            $this->publishes([
                $sourcePath => $viewPath
            ], ['views', $this->moduleNameLower . '-module-views']);

            $this->loadViewsFrom(array_merge($this->getPublishableViewPaths(), [$sourcePath]), $this->moduleNameLower);
        }
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
            $sourcePath = module_path('Core', 'Resources/lang');
            if (is_dir($sourcePath)) {
                $this->loadTranslationsFrom($sourcePath, $this->moduleNameLower);
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

    /**
     * Get the publishable view paths.
     *
     * @return array
     */
    private function getPublishableViewPaths(): array
    {
        $paths = [];
        foreach (config('view.paths') as $path) {
            if (is_dir($path . '/modules/' . $this->moduleNameLower)) {
                $paths[] = $path . '/modules/' . $this->moduleNameLower;
            }
        }
        return $paths;
    }
}


