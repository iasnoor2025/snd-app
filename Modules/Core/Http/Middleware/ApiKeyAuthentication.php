<?php

namespace Modules\Core\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Modules\Core\Services\ApiKeyService;
use Symfony\Component\HttpFoundation\Response;

class ApiKeyAuthentication
{
    public function __construct(private ApiKeyService $apiKeyService)
    {
    }

    public function handle(Request $request, Closure $next, string $requiredPermission = null): Response
    {
        $apiKey = $request->header('X-API-Key');

        if (!$apiKey) {
            return response()->json([
                'message' => 'API key is required',
            ], 401);
        }

        $key = $this->apiKeyService->validateKey($apiKey);

        if (!$key) {
            return response()->json([
                'message' => 'Invalid or expired API key',
            ], 401);
        }

        if ($requiredPermission && !$key->hasPermission($requiredPermission)) {
            return response()->json([
                'message' => 'Insufficient permissions',
            ], 403);
        }

        // Set the authenticated user for the request
        auth()->login($key->user);

        return $next($request);
    }
} 