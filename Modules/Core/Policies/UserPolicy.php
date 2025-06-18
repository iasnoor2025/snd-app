<?php

namespace Modules\Core\Policies;

use Modules\Core\Domain\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class UserPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'manager', 'hr']);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, User $model): bool
    {
        // Users can view their own profile
        if ($user->id === $model->id) {
            return true;
        }

        // Admin can view all users
        if ($user->hasRole('admin')) {
            return true;
        }

        // Manager can view employees, customers, technicians
        if ($user->hasRole('manager')) {
            return $model->hasAnyRole(['employee', 'customer', 'technician']);
        }

        // HR can view employees
        if ($user->hasRole('hr')) {
            return $model->hasRole('employee');
        }

        // Supervisor can view employees and technicians
        if ($user->hasRole('supervisor')) {
            return $model->hasAnyRole(['employee', 'technician']);
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'manager', 'hr']);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, User $model): bool
    {
        // Users can update their own profile (limited fields)
        if ($user->id === $model->id) {
            return true;
        }

        // Admin can update all users
        if ($user->hasRole('admin')) {
            return true;
        }

        // Manager can update employees, customers, technicians
        if ($user->hasRole('manager')) {
            return $model->hasAnyRole(['employee', 'customer', 'technician']);
        }

        // HR can update employees
        if ($user->hasRole('hr')) {
            return $model->hasRole('employee');
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, User $model): bool
    {
        // Users cannot delete themselves
        if ($user->id === $model->id) {
            return false;
        }

        // Admin can delete non-admin users
        if ($user->hasRole('admin')) {
            return !$model->hasRole('admin') || $user->id !== $model->id;
        }

        // Manager can delete employees, customers, technicians
        if ($user->hasRole('manager')) {
            return $model->hasAnyRole(['employee', 'customer', 'technician']);
        }

        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, User $model): bool
    {
        return $this->delete($user, $model);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, User $model): bool
    {
        return $user->hasRole('admin') && $user->id !== $model->id;
    }

    /**
     * Determine whether the user can manage roles.
     */
    public function manageRoles(User $user): bool
    {
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can assign roles.
     */
    public function assignRole(User $user, User $model, string $role): bool
    {
        // Admin can assign any role except admin to others
        if ($user->hasRole('admin')) {
            // Admin can assign admin role only to themselves
            if ($role === 'admin') {
                return $user->id === $model->id;
            }
            return true;
        }

        // Manager can assign employee, customer, technician roles
        if ($user->hasRole('manager')) {
            return in_array($role, ['employee', 'customer', 'technician']);
        }

        // HR can assign employee role
        if ($user->hasRole('hr')) {
            return $role === 'employee';
        }

        return false;
    }

    /**
     * Determine whether the user can toggle user status.
     */
    public function toggleStatus(User $user, User $model): bool
    {
        // Users cannot deactivate themselves
        if ($user->id === $model->id) {
            return false;
        }

        // Admin can toggle status of non-admin users
        if ($user->hasRole('admin')) {
            return !$model->hasRole('admin');
        }

        // Manager can toggle status of employees, customers, technicians
        if ($user->hasRole('manager')) {
            return $model->hasAnyRole(['employee', 'customer', 'technician']);
        }

        return false;
    }
}