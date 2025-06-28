<?php

namespace Modules\EquipmentManagement\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Modules\EquipmentManagement\Domain\Models\Equipment;
use Modules\EquipmentManagement\Policies\EquipmentPolicy;

class EquipmentAuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Equipment::class => EquipmentPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();
    }
} 