<?php

namespace Modules\Core\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\PersonalAccessToken;

class TokenController extends Controller
{
    /**
     * Create a new API token for the authenticated user
     */
    public function create(Request $request)
    {
        $request->validate([
            'token_name' => 'required|string|max:255',
            'abilities' => 'array',
        ]);

        $user = Auth::user();
        $abilities = $request->abilities ?? ['*'];
        $expiresAt = now()->addDays(30);

        $token = $user->createToken(
            $request->token_name,
            $abilities,
            $expiresAt
        );

        return response()->json([
            'token' => $token->plainTextToken,
            'expires_at' => $expiresAt->toIso8601String()
        ]);
    }

    /**
     * Refresh the current API token
     */
    public function refresh(Request $request)
    {
        try {
            $token = $request->bearerToken();
            if (!$token) {
                return response()->json(['message' => 'No token provided'], 401);
            }

            $tokenModel = PersonalAccessToken::findToken($token);
            if (!$tokenModel) {
                return response()->json(['message' => 'Invalid token'], 401);
            }

            $user = $tokenModel->tokenable;
            if (!$user) {
                return response()->json(['message' => 'User not found'], 401);
            }

            // Revoke old token
            $tokenModel->delete();

            // Create new token
            $expiresAt = now()->addDays(30);
            $newToken = $user->createToken(
                'api-token',
                $tokenModel->abilities,
                $expiresAt
            );

            return response()->json([
                'token' => $newToken->plainTextToken,
                'expires_at' => $expiresAt->toIso8601String()
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Token refresh failed: ' . $e->getMessage());
            return response()->json(['message' => 'Token refresh failed'], 500);
        }
    }

    /**
     * Revoke the current API token
     */
    public function revoke(Request $request)
    {
        try {
            $token = $request->bearerToken();
            if (!$token) {
                return response()->json(['message' => 'No token provided'], 401);
            }

            $tokenModel = PersonalAccessToken::findToken($token);
            if (!$tokenModel) {
                return response()->json(['message' => 'Invalid token'], 401);
            }

            $tokenModel->delete();

            return response()->json(['message' => 'Token revoked successfully']);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Token revocation failed: ' . $e->getMessage());
            return response()->json(['message' => 'Token revocation failed'], 500);
        }
    }
}


