<?php

namespace Modules\EmployeeManagement\Providers;

use Modules\EmployeeManagement\Domain\Models\EmployeeAdvance;
use Modules\EmployeeManagement\Domain\Models\EmployeeDocument;
use Modules\EmployeeManagement\Policies\EmployeeAdvancePolicy;
use Modules\EmployeeManagement\Policies\EmployeeDocumentPolicy;
use Modules\EmployeeManagement\Domain\Models\Employee;
use Modules\EmployeeManagement\Policies\EmployeePolicy;

class AuthServiceProvider extends \Illuminate\Foundation\Support\Providers\AuthServiceProvider
{
    /**
     * The module name.
     *
     * @var string
     */
    protected $moduleName = 'EmployeeManagement';

    /**
     * The policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        EmployeeDocument::class => EmployeeDocumentPolicy::class,
        EmployeeAdvance::class => EmployeeAdvancePolicy::class,
        Employee::class => EmployeePolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();
    }
}




