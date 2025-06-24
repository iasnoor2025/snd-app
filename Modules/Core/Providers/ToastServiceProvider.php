<?php

namespace Modules\Core\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\View;

class ToastServiceProvider extends ServiceProvider
{
    /**
     * Register the service provider.
     *
     * @return void
     */
    public function register(): void
    {
        // Register the core toast service
        $this->app->singleton('core.toast', function ($app) {
            return new \Modules\Core\Services\ToastService();
        });

        // Register module-specific toast services
        $this->app->singleton('employee.toast', function ($app) {
            return new \Modules\EmployeeManagement\Services\EmployeeToastService();
        });

        $this->app->singleton('rental.toast', function ($app) {
            return new \Modules\RentalManagement\Services\RentalToastService();
        });

        $this->app->singleton('equipment.toast', function ($app) {
            return new \Modules\EquipmentManagement\Services\EquipmentToastService();
        });

        // Register the toast component as a shared view component
        View::share('toast', function () {
            return view('core::components.toast');
        });
    }

    /**
     * Get the services provided by the provider.
     *
     * @return array
     */
    public function provides(): array
    {
        return [
            'core.toast',
            'employee.toast',
            'rental.toast',
            'equipment.toast',
        ];
    }

    /**
     * Boot the application events.
     *
     * @return void
     */
    public function boot(): void
    {
        // Register the toast component
        $this->publishes([
            __DIR__.'/../resources/js/components/Toast.tsx' => resource_path('js/components/Toast.tsx'),
        ], 'core-toast-component');

        // Register the toast service
        $this->publishes([
            __DIR__.'/../resources/js/services/ToastService.ts' => resource_path('js/services/ToastService.ts'),
        ], 'core-toast-service');

        // Register module-specific toast services
        $this->publishes([
            __DIR__.'/../../EmployeeManagement/resources/js/services/EmployeeToastService.ts' => resource_path('js/services/EmployeeToastService.ts'),
            __DIR__.'/../../RentalManagement/resources/js/services/RentalToastService.ts' => resource_path('js/services/RentalToastService.ts'),
            __DIR__.'/../../EquipmentManagement/resources/js/services/EquipmentToastService.ts' => resource_path('js/services/EquipmentToastService.ts'),
        ], 'module-toast-services');

        // Load views
        $this->loadViewsFrom(__DIR__.'/../resources/views', 'core');

        // Load translations
        $this->loadTranslationsFrom(__DIR__.'/../resources/lang', 'core');
    }
} 