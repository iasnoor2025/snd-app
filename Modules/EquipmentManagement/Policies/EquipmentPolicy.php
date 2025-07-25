<?php

namespace Modules\EquipmentManagement\Policies;

use Modules\EquipmentManagement\Domain\Models\Equipment;
use App\Models\User;

class EquipmentPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('equipment.view');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(?\App\Models\User $user, Equipment $equipment): bool
    {
        if (!$user || !method_exists($user, 'hasPermissionTo')) {
            \Log::warning('EquipmentPolicy:view called with invalid user', ['user' => $user]);
            return false;
        }
        return $user->hasPermissionTo('equipment.view');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('equipment.create');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Equipment $equipment): bool
    {
        return $user->hasPermissionTo('equipment.edit');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Equipment $equipment): bool
    {
        return $user->hasPermissionTo('equipment.delete');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Equipment $equipment): bool
    {
        return $user->hasPermissionTo('equipment.edit');
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Equipment $equipment): bool
    {
        return $user->hasPermissionTo('equipment.delete');
    }
}
