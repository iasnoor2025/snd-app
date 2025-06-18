<?php

namespace App\Policies;

use App\Models\User;
use Modules\CustomerManagement\Domain\Models\Customer;

class CustomerPolicy
{
    /**
     * Determine whether the user can view any customers.
     */
    public function viewAny(User $user)
    {
        return $this->isAdmin($user);
    }

    /**
     * Determine whether the user can view the customer.
     */
    public function view(User $user, Customer $customer)
    {
        return $this->isAdmin($user);
    }

    /**
     * Determine whether the user can create customers.
     */
    public function create(User $user)
    {
        return $this->isAdmin($user);
    }

    /**
     * Determine whether the user can update the customer.
     */
    public function update(User $user, Customer $customer)
    {
        return $this->isAdmin($user);
    }

    /**
     * Determine whether the user can delete the customer.
     */
    public function delete(User $user, Customer $customer)
    {
        return $this->isAdmin($user);
    }

    /**
     * Helper to check if user is admin (supports string or object roles)
     */
    protected function isAdmin(User $user)
    {
        $roles = $user->roles ?? [];
        foreach ($roles as $role) {
            if (
                (is_string($role) && strtolower($role) === 'admin') ||
                (is_object($role) && isset($role->name) && strtolower($role->name) === 'admin') ||
                (is_array($role) && isset($role['name']) && strtolower($role['name']) === 'admin')
            ) {
                return true;
            }
        }
        return false;
    }
}
