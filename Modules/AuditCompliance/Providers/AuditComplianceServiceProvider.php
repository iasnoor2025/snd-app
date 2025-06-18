<?php

namespace Modules\AuditCompliance\Providers;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Illuminate\Database\Eloquent\Factory;
use Illuminate\Console\Scheduling\Schedule;
use Modules\AuditCompliance\Console\Commands\ExecuteDataRetentionCommand;
use Modules\AuditCompliance\Console\Commands\GenerateComplianceReportCommand;
use Modules\AuditCompliance\Jobs\ComplianceMonitoringJob;
use Modules\AuditCompliance\Services\AuditLogService;
use Modules\AuditCompliance\Services\DataRetentionService;
use Modules\AuditCompliance\Services\ComplianceReportService;
use Modules\AuditCompliance\Services\GdprService;

class AuditComplianceServiceProvider extends ServiceProvider
{
    /**
     * @var string $moduleName
     */
    protected $moduleName = 'AuditCompliance';

    /**
     * @var string $moduleNameLower
     */
    protected $moduleNameLower = 'auditcompliance';

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
        $this->loadMigrationsFrom(module_path($this->moduleName, 'database/migrations'));
        $this->registerObservers();
        $this->registerEvents();
        $this->registerCommands();
        $this->registerScheduledTasks();
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

        $this->registerServices();
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
        // Example: AuditLog::observe(AuditLogObserver::class);
    }

    /**
     * Register events and listeners.
     *
     * @return void;
     */
    public function registerEvents()
    {
        // Register events and listeners here
        // Example: $this->app['events']->listen(AuditCreatedEvent::class, NotifyComplianceOfficerListener::class);
    }

    /**
     * Register services.
     *
     * @return void
     */
    protected function registerServices()
    {
        // Register AuditLogService as singleton
        $this->app->singleton(AuditLogService::class, function ($app) {
            return new AuditLogService();
        });

        // Register DataRetentionService as singleton
        $this->app->singleton(DataRetentionService::class, function ($app) {
            return new DataRetentionService();
        });

        // Register ComplianceReportService as singleton
        $this->app->singleton(ComplianceReportService::class, function ($app) {
            return new ComplianceReportService();
        });

        // Register GdprService as singleton
        $this->app->singleton(GdprService::class, function ($app) {
            return new GdprService();
        });

        // Register service aliases for easier access
        $this->app->alias(AuditLogService::class, 'audit.log');
        $this->app->alias(DataRetentionService::class, 'audit.retention');
        $this->app->alias(ComplianceReportService::class, 'audit.reports');
        $this->app->alias(GdprService::class, 'audit.gdpr');
    }

    /**
     * Register console commands.
     *
     * @return void
     */
    protected function registerCommands()
    {
        if ($this->app->runningInConsole()) {
            $this->commands([
                ExecuteDataRetentionCommand::class,
                GenerateComplianceReportCommand::class,
            ]);
        }
    }

    /**
     * Register scheduled tasks.
     *
     * @return void
     */
    protected function registerScheduledTasks()
    {
        $this->app->booted(function () {
            $schedule = $this->app->make(Schedule::class);

            // Daily compliance monitoring
            $schedule->job(new ComplianceMonitoringJob([
                'check_overdue_requests' => true,
                'check_expired_consents' => true,
                'execute_retention_policies' => false,
                'generate_daily_report' => false,
                'notify_administrators' => true,
            ]))
            ->daily()
            ->at('08:00')
            ->name('compliance-monitoring-daily')
            ->description('Daily compliance monitoring and issue detection');

            // Weekly data retention execution
            $schedule->command('audit:retention:execute --force')
                ->weekly()
                ->sundays()
                ->at('02:00')
                ->name('data-retention-weekly')
                ->description('Weekly execution of data retention policies');

            // Monthly compliance report generation
            $schedule->command('audit:report:generate gdpr_compliance --period=monthly')
                ->monthly()
                ->at('03:00')
                ->name('compliance-report-monthly')
                ->description('Monthly GDPR compliance report generation');

            // Hourly check for urgent GDPR requests (overdue by more than 5 days)
            $schedule->job(new ComplianceMonitoringJob([
                'check_overdue_requests' => true,
                'check_expired_consents' => false,
                'execute_retention_policies' => false,
                'generate_daily_report' => false,
                'notify_administrators' => true,
            ]))
            ->hourly()
            ->between('9:00', '17:00') // Only during business hours
            ->weekdays()
            ->name('compliance-monitoring-urgent')
            ->description('Hourly check for urgent compliance issues during business hours');

            // Daily cleanup of old audit logs (if retention policy exists)
            $schedule->command('audit:retention:execute --data-type=audit_logs')
                ->daily()
                ->at('01:00')
                ->name('audit-logs-cleanup')
                ->description('Daily cleanup of old audit logs based on retention policy');
        });
    }

    /**
     * Get the services provided by the provider.
     *
     * @return array;
     */
    public function provides()
    {
        return [
            AuditLogService::class,
            DataRetentionService::class,
            ComplianceReportService::class,
            GdprService::class,
            'audit.log',
            'audit.retention',
            'audit.reports',
            'audit.gdpr',
        ];
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


