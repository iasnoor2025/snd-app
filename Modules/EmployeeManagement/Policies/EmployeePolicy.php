<?php

namespace Modules\EmployeeManagement\Policies;

use Modules\EmployeeManagement\Domain\Models\Employee;
use Modules\Core\Domain\Models\User;

class EmployeePolicy
{
    /**
     * Determine whether the user can view the employee.
     *
     * @param  User  $user
     * @param  Employee  $employee
     * @return bool
     */
    public function view(User $user, Employee $employee): bool
    {
        // Allow all authenticated users to view any employee
        // return true;
        return $user->hasPermissionTo('employees.view');
    }


    // You can add more methods (create, update, delete, etc.) as needed
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('employees.create');
    }

    public function update(User $user, Employee $employee): bool
    {
        return $user->hasPermissionTo('employees.edit');
    }

    public function delete(User $user, Employee $employee): bool
    {
        return $user->hasPermissionTo('employees.delete');
    }

}
