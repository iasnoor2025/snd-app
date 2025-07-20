<?php

namespace Modules\PayrollManagement\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Gate;
use Modules\PayrollManagement\Policies\PerformanceReviewPolicy;
use Modules\PayrollManagement\Policies\PerformanceBenchmarkPolicy;
use Modules\PayrollManagement\Policies\LoanPolicy;
use Modules\EmployeeManagement\Domain\Models\PerformanceReview;
use Modules\EquipmentManagement\Domain\Models\PerformanceBenchmark;
use Modules\PayrollManagement\Domain\Models\Loan;

class PayrollManagementServiceProvider extends ServiceProvider
{
    public function boot()
    {
        $this->loadMigrationsFrom(__DIR__ . '/../database/migrations');
        $this->app->register(\Modules\PayrollManagement\Providers\RouteServiceProvider::class);

        // Register policies
        Gate::policy(PerformanceReview::class, PerformanceReviewPolicy::class);
        Gate::policy(PerformanceBenchmark::class, PerformanceBenchmarkPolicy::class);
        Gate::policy(Loan::class, LoanPolicy::class);
    }
}
