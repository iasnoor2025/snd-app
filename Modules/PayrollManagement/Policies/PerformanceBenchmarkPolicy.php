<?php

namespace Modules\PayrollManagement\Policies;

use Illuminate\Auth\Access\HandlesAuthorization;
use App\Models\User;
use Modules\EquipmentManagement\Domain\Models\PerformanceBenchmark;

class PerformanceBenchmarkPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any performance benchmarks.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('performance-benchmarks.view');
    }

    /**
     * Determine whether the user can view the performance benchmark.
     */
    public function view(User $user, PerformanceBenchmark $performanceBenchmark): bool
    {
        return $user->hasPermissionTo('performance-benchmarks.view');
    }

    /**
     * Determine whether the user can create performance benchmarks.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('performance-benchmarks.create');
    }

    /**
     * Determine whether the user can update the performance benchmark.
     */
    public function update(User $user, PerformanceBenchmark $performanceBenchmark): bool
    {
        return $user->hasPermissionTo('performance-benchmarks.edit');
    }

    /**
     * Determine whether the user can delete the performance benchmark.
     */
    public function delete(User $user, PerformanceBenchmark $performanceBenchmark): bool
    {
        return $user->hasPermissionTo('performance-benchmarks.delete');
    }

    /**
     * Determine whether the user can bulk create performance benchmarks.
     */
    public function bulkCreate(User $user): bool
    {
        return $user->hasPermissionTo('performance-benchmarks.create');
    }
}
