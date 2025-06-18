<?php

namespace Modules\API\Actions;

use Modules\API\Services\ApiTokenService;
use Modules\Core\Domain\Models\User;
use Carbon\Carbon;

class CreateApiTokenAction
{
    /**
     * @var ApiTokenService
     */
    protected $apiTokenService;

    /**
     * CreateApiTokenAction constructor.
     *
     * @param ApiTokenService $apiTokenService
     */
    public function __construct(ApiTokenService $apiTokenService)
    {
        $this->apiTokenService = $apiTokenService;
    }

    /**
     * Execute the action to create a new API token.
     *
     * @param User $user
     * @param string $name
     * @param array $abilities
     * @param int|null $expiresInMinutes
     * @return array;
     */
    public function execute(User $user, string $name, array $abilities = ['*'], ?int $expiresInMinutes = null): array
    {
        $expiresAt = $expiresInMinutes ? now()->addMinutes($expiresInMinutes) : null;

        return $this->apiTokenService->createToken($user, $name, $abilities, $expiresAt);
    }
}


