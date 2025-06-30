<?php

namespace Modules\PayrollManagement\Policies;

class PayrollPolicy
{
    // Add your policy methods here as needed
    public function viewAny($user)
    {
        return $user->hasPermissionTo('payroll.view');
    }

    public function view($user, $model = null)
    {
        return $user->hasPermissionTo('payroll.view');
    }

    public function create($user)
    {
        return $user->hasPermissionTo('payroll.create');
    }

    public function update($user, $model = null)
    {
        return $user->hasPermissionTo('payroll.edit');
    }

    public function delete($user, $model = null)
    {
        return $user->hasPermissionTo('payroll.delete');
    }
}
