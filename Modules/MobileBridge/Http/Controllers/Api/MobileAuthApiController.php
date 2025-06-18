<?php

namespace Modules\MobileBridge\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;
use Carbon\Carbon;

class MobileAuthApiController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    /**
     * Get authenticated user information
     */
    public function getUser(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();

            // Load relationships
            $user->load(['roles', 'permissions']);

            $userData = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? null,
                'avatar' => $user->avatar ?? null,
                'timezone' => $user->timezone ?? config('app.timezone', 'UTC'),
                'locale' => $user->locale ?? config('app.locale', 'en'),
                'email_verified_at' => $user->email_verified_at?->toISOString(),
                'created_at' => $user->created_at->toISOString(),
                'updated_at' => $user->updated_at->toISOString(),
                'last_login_at' => $user->last_login_at?->toISOString(),
                'is_active' => $user->is_active ?? true,
                'roles' => $user->roles->pluck('name'),
                'permissions' => $user->getAllPermissions()->pluck('name'),
                'profile' => [
                    'department' => $user->department ?? null,
                    'position' => $user->position ?? null,
                    'employee_id' => $user->employee_id ?? null,
                    'manager_id' => $user->manager_id ?? null,
                    'hire_date' => $user->hire_date?->toDateString(),
                    'bio' => $user->bio ?? null
                ],
                'preferences' => [
                    'notifications_enabled' => $user->notifications_enabled ?? true,
                    'email_notifications' => $user->email_notifications ?? true,
                    'sms_notifications' => $user->sms_notifications ?? false,
                    'theme' => $user->theme ?? 'system',
                    'language' => $user->language ?? 'en'
                ]
            ];

            // Get user statistics
            $stats = $this->getUserStats($user);
            $userData['stats'] = $stats;

            return response()->json([
                'success' => true,
                'user' => $userData
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get user data: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to get user data'
            ], 500);
        }
    }

    /**
     * Update user profile
     */
    public function updateProfile(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|string|max:255',
                'phone' => 'sometimes|nullable|string|max:20',
                'timezone' => 'sometimes|string|max:50',
                'locale' => 'sometimes|string|max:10',
                'department' => 'sometimes|nullable|string|max:100',
                'position' => 'sometimes|nullable|string|max:100',
                'bio' => 'sometimes|nullable|string|max:500',
                'avatar' => 'sometimes|nullable|image|max:2048' // 2MB max
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();
            $updateData = $request->only([
                'name', 'phone', 'timezone', 'locale',
                'department', 'position', 'bio'
            ]);

            // Handle avatar upload
            if ($request->hasFile('avatar')) {
                $avatar = $request->file('avatar');
                $avatarPath = $avatar->store('avatars', 'public');
                $updateData['avatar'] = $avatarPath;
            }

            // Update user
            $user->update($updateData);

            Log::info('User profile updated', [
                'user_id' => $user->id,
                'updated_fields' => array_keys($updateData)
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'phone' => $user->phone,
                    'timezone' => $user->timezone,
                    'locale' => $user->locale,
                    'avatar' => $user->avatar,
                    'updated_at' => $user->updated_at->toISOString()
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to update user profile: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to update profile'
            ], 500);
        }
    }

    /**
     * Update user settings/preferences
     */
    public function updateSettings(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'notifications_enabled' => 'sometimes|boolean',
                'email_notifications' => 'sometimes|boolean',
                'sms_notifications' => 'sometimes|boolean',
                'theme' => 'sometimes|in:light,dark,system',
                'language' => 'sometimes|string|max:10',
                'auto_logout_minutes' => 'sometimes|integer|min:5|max:480',
                'two_factor_enabled' => 'sometimes|boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();
            $settingsData = $request->only([
                'notifications_enabled', 'email_notifications', 'sms_notifications',
                'theme', 'language', 'auto_logout_minutes', 'two_factor_enabled'
            ]);

            // Update user settings
            $user->update($settingsData);

            // Store mobile-specific settings in cache
            $mobileSettingsKey = "mobile_settings_user_{$user->id}";
            $mobileSettings = Cache::get($mobileSettingsKey, []);
            $mobileSettings = array_merge($mobileSettings, $settingsData);
            Cache::put($mobileSettingsKey, $mobileSettings, now()->addDays(30));

            Log::info('User settings updated', [
                'user_id' => $user->id,
                'updated_settings' => array_keys($settingsData)
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Settings updated successfully',
                'settings' => $settingsData,
                'updated_at' => now()->toISOString()
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to update user settings: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to update settings'
            ], 500);
        }
    }

    /**
     * Change user password
     */
    public function changePassword(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'current_password' => 'required|string',
                'new_password' => ['required', 'string', Password::defaults(), 'confirmed'],
                'new_password_confirmation' => 'required|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();

            // Verify current password
            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'error' => 'Current password is incorrect'
                ], 422);
            }

            // Update password
            $user->update([
                'password' => Hash::make($request->new_password),
                'password_changed_at' => now()
            ]);

            // Revoke all existing tokens except current
            $currentToken = $request->user()->currentAccessToken();
            $user->tokens()->where('id', '!=', $currentToken->id)->delete();

            Log::info('User password changed', [
                'user_id' => $user->id,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Password changed successfully',
                'tokens_revoked' => true
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to change password: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to change password'
            ], 500);
        }
    }

    /**
     * Get user activity log
     */
    public function getActivityLog(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $limit = $request->get('limit', 20);
            $page = $request->get('page', 1);

            // Get activity from cache (in a real app, this would be from database)
            $activityKey = "user_activity_{$user->id}";
            $activities = Cache::get($activityKey, []);

            // Paginate results
            $offset = ($page - 1) * $limit;
            $paginatedActivities = array_slice($activities, $offset, $limit);

            return response()->json([
                'success' => true,
                'activities' => $paginatedActivities,
                'pagination' => [
                    'current_page' => $page,
                    'per_page' => $limit,
                    'total' => count($activities),
                    'last_page' => ceil(count($activities) / $limit)
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get activity log: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to get activity log'
            ], 500);
        }
    }

    /**
     * Get user sessions
     */
    public function getSessions(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();

            // Get active tokens/sessions
            $tokens = $user->tokens()->where('expires_at', '>', now())
                          ->orWhereNull('expires_at')
                          ->get();

            $sessions = $tokens->map(function ($token) use ($request) {
                $tokenData = json_decode($token->abilities ?? '[]', true);

                return [
                    'id' => $token->id,
                    'name' => $token->name,
                    'last_used_at' => $token->last_used_at?->toISOString(),
                    'created_at' => $token->created_at->toISOString(),
                    'expires_at' => $token->expires_at?->toISOString(),
                    'is_current' => $token->id === $request->user()->currentAccessToken()->id,
                    'abilities' => $tokenData
                ];
            });

            return response()->json([
                'success' => true,
                'sessions' => $sessions,
                'count' => $sessions->count()
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get user sessions: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to get sessions'
            ], 500);
        }
    }

    /**
     * Revoke a specific session
     */
    public function revokeSession(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'token_id' => 'required|integer'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();
            $tokenId = $request->token_id;
            $currentTokenId = $request->user()->currentAccessToken()->id;

            // Prevent revoking current session
            if ($tokenId == $currentTokenId) {
                return response()->json([
                    'success' => false,
                    'error' => 'Cannot revoke current session'
                ], 422);
            }

            // Revoke the specific token
            $deleted = $user->tokens()->where('id', $tokenId)->delete();

            if ($deleted) {
                Log::info('User session revoked', [
                    'user_id' => $user->id,
                    'revoked_token_id' => $tokenId
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Session revoked successfully'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'error' => 'Session not found'
                ], 404);
            }

        } catch (\Exception $e) {
            Log::error('Failed to revoke session: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to revoke session'
            ], 500);
        }
    }

    /**
     * Logout from all devices
     */
    public function logoutAllDevices(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $currentToken = $request->user()->currentAccessToken();

            // Revoke all tokens except current
            $revokedCount = $user->tokens()->where('id', '!=', $currentToken->id)->delete();

            Log::info('User logged out from all devices', [
                'user_id' => $user->id,
                'revoked_sessions' => $revokedCount
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Logged out from all other devices',
                'revoked_sessions' => $revokedCount
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to logout from all devices: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to logout from all devices'
            ], 500);
        }
    }

    /**
     * Get user statistics
     */
    private function getUserStats($user): array
    {
        // This would typically query the database for real statistics
        // For now, we'll return mock data
        return [
            'total_logins' => rand(50, 500),
            'last_login' => $user->last_login_at?->toISOString(),
            'active_sessions' => $user->tokens()->count(),
            'profile_completion' => $this->calculateProfileCompletion($user),
            'account_age_days' => $user->created_at->diffInDays(now()),
            'last_password_change' => $user->password_changed_at?->toISOString()
        ];
    }

    /**
     * Calculate profile completion percentage
     */
    private function calculateProfileCompletion($user): int
    {
        $fields = ['name', 'email', 'phone', 'avatar', 'department', 'position', 'bio'];
        $completed = 0;

        foreach ($fields as $field) {
            if (!empty($user->$field)) {
                $completed++;
            }
        }

        return round(($completed / count($fields)) * 100);
    }
}
