<?php

namespace Modules\API\Services;

use Modules\API\Domain\Models\ApiToken;
use Modules\API\Repositories\Interfaces\ApiTokenRepositoryInterface;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Modules\Core\Domain\Models\User;

class ApiTokenService
{
    /**
     * @var ApiTokenRepositoryInterface
     */
    protected $repository;

    /**
     * ApiTokenService constructor.
     *
     * @param ApiTokenRepositoryInterface $repository
     */
    public function __construct(ApiTokenRepositoryInterface $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Create a new API token for a user.
     *
     * @param User $user
     * @param string $name
     * @param array $abilities
     * @param Carbon|null $expiresAt
     * @return array;
     */
    public function createToken(User $user, string $name, array $abilities = ['*'], ?Carbon $expiresAt = null): array
    {
        // Generate a random token
        $token = Str::random(40);

        // Set expiration date if not provided
        if (!$expiresAt) {
            $expiresAt = now()->addMinutes(config('api.auth.token_expiration'));
        }

        // Create token in database
        $apiToken = $this->repository->create([
            'user_id' => $user->id,
            'name' => $name,
            'token' => $token,
            'abilities' => $abilities,
            'expires_at' => $expiresAt,
        ]);

        // Return both the plain text token and the database model
        return [
            'plain_text_token' => $token,
            'token' => $apiToken,
        ];
    }

    /**
     * Validate an API token.
     *
     * @param string $token
     * @param string|array $abilities
     * @return User|null;
     */
    public function validateToken(string $token, $abilities = '*'): ?User
    {
        // Find the token
        $apiToken = $this->repository->findByToken($token);

        // Check if token exists and is not expired
        if (!$apiToken || $apiToken->isExpired()) {
            return null;
        }

        // Update last used timestamp
        $this->repository->updateLastUsed($apiToken->id);

        // Check abilities
        if ($abilities !== '*') {
            $abilities = is_array($abilities) ? $abilities : [$abilities];

            foreach ($abilities as $ability) {
                if (!$apiToken->can($ability)) {
                    return null;
                }
            }
        }

        return $apiToken->user;
    }

    /**
     * Revoke an API token.
     *
     * @param int $id
     * @return bool;
     */
    public function revokeToken(int $id): bool
    {
        return $this->repository->delete($id);
    }

    /**
     * Revoke all tokens for a user.
     *
     * @param int $userId
     * @return int;
     */
    public function revokeAllTokens(int $userId): int
    {
        $tokens = $this->repository->getForUser($userId);
        $count = 0;

        foreach ($tokens as $token) {
            if ($this->repository->delete($token->id)) {
                $count++;
            }
        }

        return $count;
    }

    /**
     * Get all tokens for a user.
     *
     * @param int $userId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getTokensForUser(int $userId): \Illuminate\Database\Eloquent\Collection
    {
        return $this->repository->getForUser($userId);
    }

    /**
     * Prune expired tokens.
     *
     * @return int;
     */
    public function pruneExpiredTokens(): int
    {
        return $this->repository->pruneExpired();
    }
}


