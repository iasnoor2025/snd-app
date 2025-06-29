<?php

namespace Modules\Core\Policies;

use App\Models\User;
use Modules\Core\Domain\Models\ApiKey;
use Illuminate\Auth\Access\HandlesAuthorization;

class ApiKeyPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, ApiKey $apiKey): bool
    {
        return $user->id === $apiKey->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function delete(User $user, ApiKey $apiKey): bool
    {
        return $user->id === $apiKey->user_id;
    }
} 