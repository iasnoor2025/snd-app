<?php

namespace Modules\Localization\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Database\Eloquent\Factory;
use Illuminate\Support\Facades\File;

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
        $this->loadMigrationsFrom($this->getModulePath('Database/Migrations'));
        $this->registerMiddleware();
        $this->registerCommands();
        $this->registerModuleTranslations();

        $this->loadRoutesFrom($this->getModulePath('Routes/web.php'));
        $this->loadRoutesFrom($this->getModulePath('Routes/public.php'));

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

        if (file_exists($this->getModulePath('Providers/EventServiceProvider.php'))) {
            $this->app->register(EventServiceProvider::class);
        }
    }

    /**
     * Get the module path.
     *
     * @param string $path
     * @return string
     */
    protected function getModulePath($path = '')
    {
        if (function_exists('safe_module_path')) {
            return safe_module_path($this->moduleName, $path);
        }

        return module_path($this->moduleName, $path);
    }

    /**
     * Register config.
     *
     * @return void;
     */
    protected function registerConfig()
    {
        $this->publishes([
            $this->getModulePath('Config/config.php') => config_path($this->moduleNameLower . '.php')
        ], 'config');
        $this->mergeConfigFrom(
            $this->getModulePath('Config/config.php'), $this->moduleNameLower
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

        $sourcePath = $this->getModulePath('resources/views');

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
            $this->loadTranslationsFrom($this->getModulePath('resources/lang'), $this->moduleNameLower);
            $this->loadJsonTranslationsFrom($this->getModulePath('resources/lang'));
        }
    }

    /**
     * Register module translations.
     * This method registers translations for all modules in the system.
     *
     * @return void
     */
    protected function registerModuleTranslations()
    {
        // Get all modules
        $modules = array_map('basename', File::directories(base_path('Modules')));

        foreach ($modules as $module) {
            $langPath = $this->getModulePathForName($module, 'resources/lang');

            if (is_dir($langPath)) {
                // Register PHP translations
                $this->loadTranslationsFrom($langPath, $module);

                // Register JSON translations
                $this->loadJsonTranslationsFrom($langPath);
            }

            // Also check for public locales
            $publicLocalesPath = public_path("locales/$module");

            if (is_dir($publicLocalesPath)) {
                // Register each language directory as a namespace
                $languages = array_map('basename', File::directories($publicLocalesPath));

                foreach ($languages as $lang) {
                    $this->loadJsonTranslationsFrom("$publicLocalesPath/$lang");
                }
            }
        }
    }

    /**
     * Get the module path for a specific module name.
     *
     * @param string $name
     * @param string $path
     * @return string
     */
    protected function getModulePathForName($name, $path = '')
    {
        if (function_exists('safe_module_path')) {
            return safe_module_path($name, $path);
        }

        // Fallback to direct path construction
        return base_path('Modules/' . $name . ($path ? '/' . $path : ''));
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

    /**
     * Register observers.
     *
     * @return void;
     */
    protected function registerObservers()
    {
        // Register observers here based on files in Observers directory
        $observersPath = $this->getModulePath('Observers');

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
}


