<?php

namespace Modules\EmployeeManagement\Providers;

use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Route;

class RouteServiceProvider extends ServiceProvider
{
    protected string $name = 'EmployeeManagement';
    protected string $modulePath = __DIR__ . '/../../';

    /**
     * Called before routes are registered.
     *
     * Register any model bindings or pattern based filters.
     */
    public function boot(): void
    {
        parent::boot();

        // Bind {advance} to AdvancePayment, constrained by employee_id
        \Illuminate\Support\Facades\Route::bind('advance', function ($value) {
            $employeeId = request()->route('employee');
            return \Modules\EmployeeManagement\Domain\Models\AdvancePayment::where('id', $value)
                ->where('employee_id', $employeeId)
                ->firstOrFail();
        });
    }

    /**
     * Define the routes for the application.
     */
    public function map(): void
    {
        $this->mapApiRoutes();
        $this->mapWebRoutes();
    }

    /**
     * Define the "web" routes for the application.
     *
     * These routes all receive session state, CSRF protection, etc.
     */
    protected function mapWebRoutes(): void
    {
        Route::middleware('web')
            ->group(module_path('EmployeeManagement', '/Routes/web.php'));
    }

    /**
     * Define the "api" routes for the application.
     *
     * These routes are typically stateless.
     */
    protected function mapApiRoutes(): void
    {
        Route::middleware('api')->prefix('api')->name('api.')->group(module_path('EmployeeManagement', '/Routes/api.php'));
    }
}
