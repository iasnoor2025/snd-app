<?php

namespace Modules\Settings\Http\Controllers\Api;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Exception;

class ProfileApiController extends Controller
{
    /**
     * Get user profile
     */
    public function getProfile(): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'avatar' => $user->avatar ?? null,
                    'phone' => $user->phone ?? null,
                    'position' => $user->position ?? null,
                    'department' => $user->department ?? null,
                    'bio' => $user->bio ?? null,
                    'preferences' => $user->preferences ?? [],
                    'created_at' => $user->created_at?->format('Y-m-d H:i:s'),
                    'updated_at' => $user->updated_at?->format('Y-m-d H:i:s'),
                ]
            ]);
        } catch (Exception $e) {
            Log::error('Failed to get user profile', ['error' => $e->getMessage()]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update user profile
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . Auth::id(),
            'phone' => 'nullable|string|max:50',
            'position' => 'nullable|string|max:100',
            'department' => 'nullable|string|max:100',
            'bio' => 'nullable|string|max:500',
            'preferences' => 'nullable|array',
        ]);

        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            // Update user profile
            DB::table('users')
                ->where('id', $user->id)
                ->update([
                    'name' => $validated['name'],
                    'email' => $validated['email'],
                    'phone' => $validated['phone'] ?? null,
                    'position' => $validated['position'] ?? null,
                    'department' => $validated['department'] ?? null,
                    'bio' => $validated['bio'] ?? null,
                    'preferences' => json_encode($validated['preferences'] ?? []),
                    'updated_at' => now(),
                ]);

            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully'
            ]);
        } catch (Exception $e) {
            Log::error('Failed to update user profile', ['error' => $e->getMessage()]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update user avatar
     */
    public function updateAvatar(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            $avatarFile = $request->file('avatar');
            
            // Store the avatar
            $avatarPath = $avatarFile->store('avatars', 'public');

            // Delete old avatar if it exists
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }

            // Update user avatar
            DB::table('users')
                ->where('id', $user->id)
                ->update([
                    'avatar' => $avatarPath,
                    'updated_at' => now(),
                ]);

            return response()->json([
                'success' => true,
                'message' => 'Avatar updated successfully',
                'data' => [
                    'avatar_path' => $avatarPath,
                    'avatar_url' => Storage::url($avatarPath)
                ]
            ]);
        } catch (Exception $e) {
            Log::error('Failed to update user avatar', ['error' => $e->getMessage()]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update avatar',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 