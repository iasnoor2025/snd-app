<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;
use Illuminate\Support\Facades\Gate;
use App\Policies\CustomerPolicy;
use Modules\CustomerManagement\Domain\Models\Customer;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Share common data with Inertia
        Inertia::share('appName', config('app.name'));

        // Set root view for Inertia responses
        Inertia::setRootView('app');

        // Register Inertia namespace for specific modules
        $this->registerInertiaNamespaces();

        Gate::policy(Customer::class, CustomerPolicy::class);
    }

    /**
     * Register custom namespaces for Inertia pages
     */
    private function registerInertiaNamespaces(): void
    {
        // This allows Inertia to resolve module pages
        Inertia::share('resolvedPaths', [
            'Employees' => base_path('Modules/EmployeeManagement/resources/js/pages/Employees'),
            'Customers' => base_path('Modules/CustomerManagement/resources/js/pages/Customers'),
            'Rentals' => base_path('Modules/RentalManagement/resources/js/pages/Rentals'),
        ]);
    }
}
