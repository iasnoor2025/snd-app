<?php

namespace Modules\Core\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Modules\Core\Services\ApiKeyService;
use Carbon\Carbon;

class ApiKeyController extends Controller
{
    public function __construct(private ApiKeyService $apiKeyService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $keys = $request->user()->apiKeys()
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($key) {
                return [
                    'id' => $key->id,
                    'name' => $key->name,
                    'last_used_at' => $key->last_used_at?->diffForHumans(),
                    'expires_at' => $key->expires_at?->format('Y-m-d H:i:s'),
                    'scopes' => $key->scopes,
                ];
            });

        return response()->json(['data' => $keys]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'scopes' => 'nullable|array',
            'expires_at' => 'nullable|date|after:now',
        ]);

        $expiresAt = $request->input('expires_at') ? Carbon::parse($request->input('expires_at')) : null;

        $apiKey = $this->apiKeyService->createKey(
            $request->user(),
            $request->input('name'),
            $request->input('scopes', ['*']),
            $expiresAt
        );

        return response()->json([
            'message' => 'API key created successfully',
            'data' => [
                'id' => $apiKey->id,
                'name' => $apiKey->name,
                'key' => $apiKey->key, // Only shown once upon creation
                'scopes' => $apiKey->scopes,
                'expires_at' => $apiKey->expires_at?->format('Y-m-d H:i:s'),
            ],
        ], 201);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $apiKey = $request->user()->apiKeys()->findOrFail($id);
        $this->apiKeyService->revokeKey($apiKey);

        return response()->json([
            'message' => 'API key revoked successfully',
        ]);
    }
} 