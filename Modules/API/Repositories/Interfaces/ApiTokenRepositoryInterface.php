<?php

namespace Modules\API\Repositories\Interfaces;

use Modules\API\Domain\Models\ApiToken;
use Illuminate\Database\Eloquent\Collection; interface ApiTokenRepositoryInterface
{
    /**
     * Find a token by its ID.
     *
     * @param int $id
     * @return ApiToken|null;
     */
    public function find(int $id): ?ApiToken;

    /**
     * Find a token by its value.
     *
     * @param string $token
     * @return ApiToken|null;
     */
    public function findByToken(string $token): ?ApiToken;

    /**
     * Get all tokens for a user.
     *
     * @param int $userId
     * @return Collection;
     */
    public function getForUser(int $userId): Collection;

    /**
     * Create a new token.
     *
     * @param array $data
     * @return ApiToken;
     */
    public function create(array $data): ApiToken;

    /**
     * Update a token.
     *
     * @param int $id
     * @param array $data
     * @return ApiToken;
     */
    public function update(int $id, array $data): ApiToken;

    /**
     * Delete a token.
     *
     * @param int $id
     * @return bool;
     */
    public function delete(int $id): bool;

    /**
     * Update the last used timestamp of a token.
     *
     * @param int $id
     * @return bool;
     */
    public function updateLastUsed(int $id): bool;

    /**
     * Delete expired tokens.
     *
     * @return int Number of deleted tokens;
     */
    public function pruneExpired(): int;
}


