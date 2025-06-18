<?php

namespace App\Providers;

use Modules\Core\Domain\Models\User;
use Modules\Core\Policies\UserPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        User::class => UserPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();

        // Define gates for permissions
        Gate::define('manage-roles', function (User $user) {
            return $user->hasRole('admin');
        });

        Gate::define('manage-permissions', function (User $user) {
            return $user->hasRole('admin');
        });

        Gate::define('view-admin-dashboard', function (User $user) {
            return $user->hasAnyRole(['admin', 'manager']);
        });

        Gate::define('manage-users', function (User $user) {
            return $user->hasAnyRole(['admin', 'manager', 'hr']);
        });

        Gate::define('view-reports', function (User $user) {
            return $user->hasAnyRole(['admin', 'manager', 'accountant']);
        });

        Gate::define('manage-rentals', function (User $user) {
            return $user->hasAnyRole(['admin', 'manager', 'employee']);
        });

        Gate::define('manage-equipment', function (User $user) {
            return $user->hasAnyRole(['admin', 'manager', 'technician']);
        });

        Gate::define('manage-customers', function (User $user) {
            return $user->hasAnyRole(['admin', 'manager', 'employee']);
        });

        Gate::define('manage-employees', function (User $user) {
            return $user->hasAnyRole(['admin', 'manager', 'hr']);
        });

        Gate::define('manage-payroll', function (User $user) {
            return $user->hasAnyRole(['admin', 'hr', 'accountant']);
        });

        Gate::define('view-financial-reports', function (User $user) {
            return $user->hasAnyRole(['admin', 'manager', 'accountant']);
        });

        Gate::define('manage-maintenance', function (User $user) {
            return $user->hasAnyRole(['admin', 'manager', 'technician', 'supervisor']);
        });

        // Implicitly grant "Super Admin" role all permissions
        // This works in the app by using gate-related functions like auth()->user()->can() and @can()
        Gate::before(function (User $user, string $ability) {
            return $user->hasRole('admin') ? true : null;
        });
    }
}