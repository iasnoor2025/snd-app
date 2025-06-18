<?php

namespace Modules\EmployeeManagement\Policies;

use Illuminate\Auth\Access\HandlesAuthorization;
use Modules\Core\Domain\Models\User;
use Modules\EmployeeManagement\Domain\Models\EmployeeDocument;

class EmployeeDocumentPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view employee documents');
    }

    public function view(User $user, EmployeeDocument $document): bool
    {
        return $user->hasPermissionTo('view employee documents') &&
            ($user->id === $document->employee->user_id || $user->hasRole('admin'));
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create employee documents');
    }

    public function update(User $user, EmployeeDocument $document): bool
    {
        return $user->hasPermissionTo('update employee documents') &&
            ($user->id === $document->employee->user_id || $user->hasRole('admin'));
    }

    public function delete(User $user, EmployeeDocument $document): bool
    {
        return $user->hasPermissionTo('delete employee documents') &&
            ($user->id === $document->employee->user_id || $user->hasRole('admin'));
    }

    public function verify(User $user, EmployeeDocument $document): bool
    {
        return $user->hasPermissionTo('verify employee documents') &&
            $document->status === 'pending';
    }

    public function reject(User $user, EmployeeDocument $document): bool
    {
        return $user->hasPermissionTo('verify employee documents') &&
            $document->status === 'pending';
    }

    public function viewExpiring(User $user): bool
    {
        return $user->hasPermissionTo('view employee documents');
    }

    public function viewExpired(User $user): bool
    {
        return $user->hasPermissionTo('view employee documents');
    }

    public function viewPendingVerification(User $user): bool
    {
        return $user->hasPermissionTo('verify employee documents');
    }
}


