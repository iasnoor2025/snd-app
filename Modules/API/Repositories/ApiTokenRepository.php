<?php

namespace Modules\API\Repositories;

use Modules\API\Domain\Models\ApiToken;
use Modules\API\Repositories\Interfaces\ApiTokenRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class ApiTokenRepository implements ApiTokenRepositoryInterface
{
    /**
     * Find a token by its ID.
     *
     * @param int $id
     * @return ApiToken|null;
     */
    public function find(int $id): ?ApiToken
    {
        return ApiToken::find($id);
    }

    /**
     * Find a token by its value.
     *
     * @param string $token
     * @return ApiToken|null;
     */
    public function findByToken(string $token): ?ApiToken
    {
        return ApiToken::where('token', hash('sha256', $token))->first();
    }

    /**
     * Get all tokens for a user.
     *
     * @param int $userId
     * @return Collection;
     */
    public function getForUser(int $userId): Collection
    {
        return ApiToken::where('user_id', $userId)->get();
    }

    /**
     * Create a new token.
     *
     * @param array $data
     * @return ApiToken;
     */
    public function create(array $data): ApiToken
    {
        // If token is provided, hash it
        if (isset($data['token'])) {
            $data['token'] = hash('sha256', $data['token']);
        }

        return ApiToken::create($data);
    }

    /**
     * Update a token.
     *
     * @param int $id
     * @param array $data
     * @return ApiToken;
     */
    public function update(int $id, array $data): ApiToken
    {
        $token = $this->find($id);

        if ($token) {
            $token->update($data);
        }

        return $token;
    }

    /**
     * Delete a token.
     *
     * @param int $id
     * @return bool;
     */
    public function delete(int $id): bool
    {
        $token = $this->find($id);

        if ($token) {
            return $token->delete();
        }

        return false;
    }

    /**
     * Update the last used timestamp of a token.
     *
     * @param int $id
     * @return bool;
     */
    public function updateLastUsed(int $id): bool
    {
        $token = $this->find($id);

        if ($token) {
            return $token->update(['last_used_at' => now()]);
        }

        return false;
    }

    /**
     * Delete expired tokens.
     *
     * @return int Number of deleted tokens;
     */
    public function pruneExpired(): int
    {
        return ApiToken::where('expires_at', '<', now())->delete();
    }
}


