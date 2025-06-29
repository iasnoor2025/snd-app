<?php

namespace Modules\Core\Services;

use Illuminate\Support\Str;
use Modules\Core\Domain\Models\ApiKey;
use App\Models\User;
use Carbon\Carbon;

class ApiKeyService
{
    public function createKey(User $user, string $name, array $scopes = ['*'], ?Carbon $expiresAt = null): ApiKey
    {
        return ApiKey::create([
            'user_id' => $user->id,
            'name' => $name,
            'key' => $this->generateUniqueKey(),
            'scopes' => $scopes,
            'expires_at' => $expiresAt,
        ]);
    }

    public function validateKey(string $key): ?ApiKey
    {
        $apiKey = ApiKey::where('key', $key)->first();

        if (!$apiKey || $apiKey->isExpired()) {
            return null;
        }

        $apiKey->markAsUsed();
        return $apiKey;
    }

    public function revokeKey(ApiKey $apiKey): void
    {
        $apiKey->delete();
    }

    public function revokeExpiredKeys(): int
    {
        return ApiKey::whereNotNull('expires_at')
            ->where('expires_at', '<', now())
            ->delete();
    }

    protected function generateUniqueKey(): string
    {
        do {
            $key = sprintf(
                '%s.%s.%s',
                config('app.name'),
                Str::random(32),
                hash_hmac('sha256', Str::random(), config('app.key'))
            );
        } while (ApiKey::where('key', $key)->exists());

        return $key;
    }

    public function updateKey(
        ApiKey $apiKey,
        array $data
    ): ApiKey {
        $apiKey->update([
            'name' => $data['name'] ?? $apiKey->name,
            'scopes' => $data['scopes'] ?? $apiKey->scopes,
            'expires_at' => isset($data['expires_at']) ? Carbon::parse($data['expires_at']) : $apiKey->expires_at,
        ]);

        return $apiKey->fresh();
    }

    public function listKeys(User $user): array
    {
        return $user->apiKeys()
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($key) {
                return [
                    'id' => $key->id,
                    'name' => $key->name,
                    'key' => $key->key,
                    'scopes' => $key->scopes,
                    'last_used_at' => $key->last_used_at?->diffForHumans(),
                    'expires_at' => $key->expires_at?->format('Y-m-d H:i:s'),
                    'created_at' => $key->created_at->format('Y-m-d H:i:s'),
                ];
            })
            ->toArray();
    }

    public function getAvailablePermissions(): array
    {
        return [
            'read:users',
            'write:users',
            'read:equipment',
            'write:equipment',
            'read:rentals',
            'write:rentals',
            'read:reports',
            'write:reports',
        ];
    }
} 