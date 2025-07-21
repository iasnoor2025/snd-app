<?php

namespace Modules\EmployeeManagement\Observers;

use Modules\EmployeeManagement\Domain\Models\Employee;
use Modules\Core\Domain\Models\User;

class EmployeeObserver
{
    /**
     * Handle the Employee "saved" event.
     * Update the user's name to match the employee's full name when user_id is assigned or changed.
     */
    public function saved(Employee $employee)
    {
        if ($employee->user_id) {
            $user = User::find($employee->user_id);
            if ($user) {
                $fullName = trim($employee->first_name . ' ' . $employee->last_name);
                if ($user->name !== $fullName) {
                    $user->name = $fullName;
                    $user->save();
                }
            }
        }
    }
}
