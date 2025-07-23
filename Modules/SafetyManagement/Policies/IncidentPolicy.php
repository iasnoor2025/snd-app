<?php

namespace Modules\SafetyManagement\Policies;

use App\Models\User;
use Modules\SafetyManagement\Domain\Models\Incident;

class IncidentPolicy
{
    public function viewAny(User $user)
    {
        // Allow all admins, supervisors, safety managers, and anyone with incidents.view permission
        return $user->hasRole(['admin', 'supervisor', 'safety_manager']) || $user->can('incidents.view');
    }

    public function view(User $user, Incident $incident)
    {
        return $user->id === $incident->user_id || $user->hasRole(['supervisor', 'safety_manager']);
    }

    public function create(User $user)
    {
        return $user->hasRole(['operator', 'supervisor', 'safety_manager']);
    }

    public function update(User $user, Incident $incident)
    {
        return $user->id === $incident->user_id || $user->hasRole('safety_manager');
    }

    public function delete(User $user, Incident $incident)
    {
        return $user->hasRole('safety_manager');
    }

    public function approve(User $user, Incident $incident)
    {
        return $user->hasRole('safety_manager');
    }
}
