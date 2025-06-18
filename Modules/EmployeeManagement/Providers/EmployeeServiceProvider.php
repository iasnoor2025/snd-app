<?php

namespace Modules\EmployeeManagement\Providers;

use Illuminate\Support\ServiceProvider;
use Modules\EmployeeManagement\Domain\Models\Employee;
use Modules\EmployeeManagement\Domain\Models\EmployeeAdvance;
use Modules\EmployeeManagement\Domain\Models\EmployeeDocument;
use Modules\EmployeeManagement\Domain\Models\EmployeeTimesheet;
use Modules\EmployeeManagement\Repositories\EmployeeAdvanceRepository;
use Modules\EmployeeManagement\Repositories\EmployeeAdvanceRepositoryInterface;
use Modules\EmployeeManagement\Repositories\EmployeeDocumentRepository;
use Modules\EmployeeManagement\Repositories\EmployeeDocumentRepositoryInterface;
use Modules\EmployeeManagement\Repositories\EmployeeRepository;
use Modules\EmployeeManagement\Repositories\EmployeeRepositoryInterface;
use Modules\EmployeeManagement\Repositories\EmployeeTimesheetRepository;
use Modules\EmployeeManagement\Repositories\EmployeeTimesheetRepositoryInterface;
use Modules\EmployeeManagement\Services\EmployeeAdvanceService;
use Modules\EmployeeManagement\Services\EmployeeDocumentService;
use Modules\EmployeeManagement\Services\EmployeeService;
use Modules\EmployeeManagement\Services\EmployeeTimesheetService;

class EmployeeServiceProvider extends ServiceProvider
{
    /**
     * The module name.
     *
     * @var string
     */
    protected $moduleName = 'EmployeeManagement';

    /**
     * Boot the application events.
     */
    public function boot(): void
    {
        $this->registerConfig();
        $this->loadMigrationsFrom(module_path($this->moduleName, 'database/migrations'));
        $this->loadRoutesFrom(module_path($this->moduleName, 'routes/web.php'));
        $this->loadRoutesFrom(module_path($this->moduleName, 'routes/api.php'));
        $this->loadViewsFrom(module_path($this->moduleName, 'resources/views'), $this->moduleNameLower);
        $this->loadTranslationsFrom(module_path($this->moduleName, 'resources/lang'), $this->moduleNameLower);
    }

    /**
     * Register the service provider.
     */
    public function register(): void
    {
        $this->app->register(RouteServiceProvider::class);

        // Register Repositories
        $this->app->bind(EmployeeRepositoryInterface::class, function ($app) {
            return new EmployeeRepository(new Employee());
        });

        $this->app->bind(EmployeeDocumentRepositoryInterface::class, function ($app) {
            return new EmployeeDocumentRepository(new EmployeeDocument());
        });

        $this->app->bind(EmployeeAdvanceRepositoryInterface::class, function ($app) {
            return new EmployeeAdvanceRepository(new EmployeeAdvance());
        });

        $this->app->bind(EmployeeTimesheetRepositoryInterface::class, function ($app) {
            return new EmployeeTimesheetRepository(new EmployeeTimesheet());
        });

        // Register Services
        $this->app->bind(EmployeeService::class, function ($app) {
            return new EmployeeService(
                $app->make(EmployeeRepositoryInterface::class)
            );
        });

        $this->app->bind(EmployeeDocumentService::class, function ($app) {
            return new EmployeeDocumentService(
                $app->make(EmployeeDocumentRepositoryInterface::class),
                $app->make(EmployeeRepositoryInterface::class)
            );
        });

        $this->app->bind(EmployeeAdvanceService::class, function ($app) {
            return new EmployeeAdvanceService(
                $app->make(EmployeeAdvanceRepositoryInterface::class)
            );
        });

        $this->app->bind(EmployeeTimesheetService::class, function ($app) {
            return new EmployeeTimesheetService(
                $app->make(EmployeeTimesheetRepositoryInterface::class),
                $app->make(EmployeeRepositoryInterface::class),
                $app->has('Modules\Project\Repositories\ProjectRepositoryInterface')
                    ? $app->make('Modules\Project\Repositories\ProjectRepositoryInterface')
                    : null
            );
        });
    }

    /**
     * Register config.
     */
    protected function registerConfig(): void
    {
        $this->publishes([
            module_path($this->moduleName, 'config/config.php') => config_path($this->moduleNameLower . '.php')
        ], 'config');
        $this->mergeConfigFrom(
            module_path($this->moduleName, 'config/config.php'), $this->moduleNameLower
        );
    }

    /**
     * Get the services provided by the provider.
     */
    public function provides(): array
    {
        return [];
    }

    private function getPublishableViewPaths(): array
    {
        $paths = [];
        foreach (config('view.paths') as $path) {
            if (is_dir($path.'/modules/'.$this->moduleNameLower)) {
                $paths[] = $path.'/modules/'.$this->moduleNameLower;
            }
        }
        return $paths;
    }
}


