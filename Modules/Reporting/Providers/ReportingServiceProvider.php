<?php

namespace Modules\Reporting\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Route;
use Illuminate\Database\Eloquent\Factory;
use Illuminate\Support\Facades\Vite;

class ReportingServiceProvider extends ServiceProvider
{
    /**
     * @var string $moduleName
     */
    protected $moduleName = 'Reporting';

    /**
     * @var string $moduleNameLower
     */
    protected $moduleNameLower = 'reporting';

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

        // Register Vite assets
        if (file_exists(module_path($this->moduleName, 'resources/js/app.js'))) {
            Vite::useHotFile(public_path('hot'))
                ->useBuildDirectory('build')
                ->withEntryPoints([
                    'Modules/Reporting/resources/js/app.js',
                    'Modules/Reporting/resources/css/app.css'
                ]);
        }

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
        $this->app->register(EventServiceProvider::class);
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
     * Register model observers.
     *
     * @return void;
     */
    protected function registerObservers()
    {
        // Temporarily commenting out observers until these models are properly created or migrated
        // \Modules\Reporting\Domain\Models\Leave::observe(\Modules\Reporting\Observers\LeaveObserver::class);
        // \Modules\Reporting\Domain\Models\LeaveRequest::observe(\Modules\Reporting\Observers\LeaveRequestObserver::class);
        // \Modules\Reporting\Domain\Models\LeaveType::observe(\Modules\Reporting\Observers\LeaveTypeObserver::class);
    }
}


