<?php

namespace Modules\SafetyManagement\Policies;

use App\Models\User;
use Modules\SafetyManagement\Domain\Models\Inspection;

class InspectionPolicy
{
    public function view(User $user, Inspection $inspection)
    {
        return $user->id === $inspection->user_id || $user->hasRole(['supervisor', 'safety_manager']);
    }

    public function create(User $user)
    {
        return $user->hasRole(['operator', 'supervisor', 'safety_manager']);
    }

    public function update(User $user, Inspection $inspection)
    {
        return $user->id === $inspection->user_id || $user->hasRole('safety_manager');
    }

    public function delete(User $user, Inspection $inspection)
    {
        return $user->hasRole('safety_manager');
    }

    public function approve(User $user, Inspection $inspection)
    {
        return $user->hasRole('safety_manager');
    }
}
