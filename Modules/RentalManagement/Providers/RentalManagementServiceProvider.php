<?php

namespace Modules\RentalManagement\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Route;
use Illuminate\Database\Eloquent\Factory;
use Modules\RentalManagement\Providers\RouteServiceProvider;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Arr;
use Modules\Core\Services\CacheManagerService;
use Modules\Core\Services\ThemeManagerService;
use Modules\Localization\Services\TranslationService;
use Modules\Notifications\Services\NotificationService;
use Illuminate\Support\Facades\Vite;
use Modules\RentalManagement\Database\Seeders\RentalDatabaseSeeder;
use Modules\RentalManagement\Console\Commands\SeedRentalDataCommand;
use Illuminate\Support\Facades\Gate;
use Modules\RentalManagement\Domain\Models\Quotation;
use Modules\RentalManagement\Policies\QuotationPolicy;
use Modules\RentalManagement\Domain\Models\Rental;
use Modules\RentalManagement\Observers\RentalObserver;
use Modules\RentalManagement\Domain\Models\RentalOperatorAssignment;
use Modules\RentalManagement\Observers\RentalOperatorAssignmentObserver;
use Modules\RentalManagement\Domain\Models\RentalItem;
use Modules\RentalManagement\Observers\RentalItemObserver;

class RentalManagementServiceProvider extends ServiceProvider
{
    /**
     * @var string $moduleName
     */
    protected $moduleName = 'RentalManagement';

    /**
     * @var string $moduleNameLower
     */
    protected $moduleNameLower = 'rentalmanagement';

    /**
     * Boot the application events.
     *
     * @return void
     */
    public function boot()
    {
        RentalOperatorAssignment::observe(RentalOperatorAssignmentObserver::class);
        Rental::observe(RentalObserver::class);
        RentalItem::observe(RentalItemObserver::class);
        $this->loadViewsFrom(base_path('Modules/RentalManagement/Resources/views'), 'RentalManagement');
        $this->registerTranslations();
        $this->registerConfig();
        // Only set pgsql as default if not running tests
        if (!app()->environment('testing')) {
            $this->app->make('db')->setDefaultConnection('pgsql');
        }
        // Register Quotation policy
        Gate::policy(Quotation::class, QuotationPolicy::class);
        // Register Vite assets
        Vite::useHotFile(public_path('hot'))
            ->useBuildDirectory('build-rental')
            ->withEntryPoints([
                'Modules/RentalManagement/resources/js/app.tsx',
            ]);
        if ($this->app->runningInConsole()) {
            $this->commands([
                SeedRentalDataCommand::class,
            ]);
        }
    }

    /**
     * Register the service provider.
     *
     * @return void
     */
    public function register()
    {
        $this->app->bind(\Modules\RentalManagement\Repositories\Interfaces\PaymentRepositoryInterface::class,
            \Modules\RentalManagement\Repositories\PaymentRepository::class
        );

        $this->app->bind(\Modules\RentalManagement\Repositories\Interfaces\RentalRepositoryInterface::class,
            function ($app) {
                return new \Modules\RentalManagement\Repositories\RentalRepository(new \Modules\RentalManagement\Domain\Models\Rental());
            }
        );

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
     * Register observers for models
     */
    protected function registerObservers()
    {
        // Register observers for Rental models
        // \Modules\RentalManagement\Domain\Models\Rental::observe(\Modules\RentalManagement\Observers\RentalObserver::class);
        // \Modules\RentalManagement\Domain\Models\RentalItem::observe(\Modules\RentalManagement\Observers\RentalItemObserver::class);
    }
}


