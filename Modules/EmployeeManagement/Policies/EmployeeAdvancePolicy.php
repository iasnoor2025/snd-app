<?php

namespace Modules\EmployeeManagement\Policies;

use Illuminate\Auth\Access\HandlesAuthorization;
use Modules\Core\Domain\Models\User;
use Modules\EmployeeManagement\Domain\Models\EmployeeAdvance;

class EmployeeAdvancePolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view employee advances');
    }

    public function view(User $user, EmployeeAdvance $advance): bool
    {
        return $user->hasPermissionTo('view employee advances') &&
            ($user->id === $advance->employee->user_id || $user->hasRole('admin'));
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create employee advances');
    }

    public function update(User $user, EmployeeAdvance $advance): bool
    {
        return $user->hasPermissionTo('update employee advances') &&
            ($user->id === $advance->employee->user_id || $user->hasRole('admin'));
    }

    public function delete(User $user, EmployeeAdvance $advance): bool
    {
        return $user->hasPermissionTo('delete employee advances') &&
            ($user->id === $advance->employee->user_id || $user->hasRole('admin'));
    }

    public function approve(User $user, EmployeeAdvance $advance): bool
    {
        return $user->hasPermissionTo('approve employee advances') &&
            $advance->status === 'pending';
    }

    public function reject(User $user, EmployeeAdvance $advance): bool
    {
        return $user->hasPermissionTo('approve employee advances') &&
            $advance->status === 'pending';
    }

    public function processDeduction(User $user, EmployeeAdvance $advance): bool
    {
        return $user->hasPermissionTo('process employee advances') &&
            $advance->status === 'approved' &&
            ($advance->amount - $advance->repaid_amount) > 0;
    }

    public function viewPending(User $user): bool
    {
        return $user->hasPermissionTo('view employee advances');
    }

    public function viewActive(User $user): bool
    {
        return $user->hasPermissionTo('view employee advances');
    }

    public function viewUpcomingDeductions(User $user): bool
    {
        return $user->hasPermissionTo('view employee advances');
    }

    public function viewOverdueDeductions(User $user): bool
    {
        return $user->hasPermissionTo('view employee advances');
    }

    public function viewDeductionSchedule(User $user, EmployeeAdvance $advance): bool
    {
        return $user->hasPermissionTo('view employee advances') &&
            ($user->id === $advance->employee->user_id || $user->hasRole('admin'));
    }
}


