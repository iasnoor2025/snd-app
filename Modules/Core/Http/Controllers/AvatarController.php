<?php

namespace Modules\Core\Http\Controllers;

use App\Http\Requests\AvatarUploadRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Facades\Image;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Laravolt\Avatar\Facade as Avatar;

class AvatarController extends \Modules\Core\Http\Controllers\Controller
{
    /**
     * Upload user avatar
     */
    public function upload(AvatarUploadRequest $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $file = $request->file('avatar');

            // Generate unique filename
            $filename = 'avatar_' . $user->id . '_' . time() . '.' . $file->getClientOriginalExtension();

            // Process and optimize image
            $image = Image::make($file)
                ->fit(300, 300) // Resize to 300x300
                ->encode('jpg', 85); // Convert to JPG with 85% quality

            // Store the processed image
            $path = 'avatars/' . $filename;
            Storage::disk('public')->put($path, $image->stream());

            // Remove old avatar if exists
            if ($user->avatar) {
                $this->removeOldAvatar($user->avatar);
            }

            // Update user avatar
            $avatarUrl = Storage::disk('public')->url($path);
            $user->update(['avatar' => $avatarUrl]);

            // Log activity
            activity()
                ->causedBy($user)
                ->performedOn($user)
                ->withProperties(['avatar_url' => $avatarUrl])
                ->log('Avatar updated');

            return response()->json([
                'success' => true,
                'message' => 'Avatar uploaded successfully',
                'avatar_url' => $avatarUrl,
                'user' => $user->fresh()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload avatar: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upload avatar using Spatie Media Library
     */
    public function uploadWithMedia(AvatarUploadRequest $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $file = $request->file('avatar');

            // Clear existing avatar media
            $user->clearMediaCollection('avatars');

            // Add new avatar
            $media = $user->addMediaFromRequest('avatar')
                ->usingFileName('avatar_' . $user->id . '_' . time() . '.' . $file->getClientOriginalExtension())
                ->toMediaCollection('avatars');

            // Generate conversions (thumbnails)
            $avatarUrl = $media->getUrl();
            $thumbnailUrl = $media->getUrl('thumb');

            // Update user avatar URL
            $user->update(['avatar' => $avatarUrl]);

            // Log activity
            activity()
                ->causedBy($user)
                ->performedOn($user)
                ->withProperties([
                    'avatar_url' => $avatarUrl,
                    'thumbnail_url' => $thumbnailUrl,
                    'media_id' => $media->id
                ])
                ->log('Avatar updated with media library');

            return response()->json([
                'success' => true,
                'message' => 'Avatar uploaded successfully',
                'avatar_url' => $avatarUrl,
                'thumbnail_url' => $thumbnailUrl,
                'media_id' => $media->id,
                'user' => $user->fresh()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload avatar: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Set avatar from URL
     */
    public function setFromUrl(Request $request): JsonResponse
    {
        $request->validate([
            'avatar_url' => 'required|url|max:500'
        ]);

        try {
            $user = Auth::user();
            $avatarUrl = $request->input('avatar_url');

            // Validate that the URL points to an actual image
            $headers = get_headers($avatarUrl, 1);
            if (!$headers || !isset($headers['Content-Type'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid image URL'
                ], 400);
            }

            $contentType = is_array($headers['Content-Type'])
                ? $headers['Content-Type'][0]
                : $headers['Content-Type'];

            if (!str_starts_with($contentType, 'image/')) {
                return response()->json([
                    'success' => false,
                    'message' => 'URL does not point to an image'
                ], 400);
            }

            // Remove old avatar if it's a local file
            if ($user->avatar && str_contains($user->avatar, config('app.url'))) {
                $this->removeOldAvatar($user->avatar);
            }

            // Update user avatar
            $user->update(['avatar' => $avatarUrl]);

            // Log activity
            activity()
                ->causedBy($user)
                ->performedOn($user)
                ->withProperties(['avatar_url' => $avatarUrl])
                ->log('Avatar set from URL');

            return response()->json([
                'success' => true,
                'message' => 'Avatar updated successfully',
                'avatar_url' => $avatarUrl,
                'user' => $user->fresh()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to set avatar: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove user avatar
     */
    public function remove(): JsonResponse
    {
        try {
            $user = Auth::user();

            if (!$user->avatar) {
                return response()->json([
                    'success' => false,
                    'message' => 'No avatar to remove'
                ], 400);
            }

            $oldAvatar = $user->avatar;

            // Remove file if it's stored locally
            if (str_contains($oldAvatar, config('app.url'))) {
                $this->removeOldAvatar($oldAvatar);
            }

            // Clear media library avatars
            $user->clearMediaCollection('avatars');

            // Update user
            $user->update(['avatar' => null]);

            // Log activity
            activity()
                ->causedBy($user)
                ->performedOn($user)
                ->withProperties(['old_avatar_url' => $oldAvatar])
                ->log('Avatar removed');

            return response()->json([
                'success' => true,
                'message' => 'Avatar removed successfully',
                'user' => $user->fresh()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to remove avatar: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user avatar info
     */
    public function show(): JsonResponse
    {
        $user = Auth::user();

        $avatarInfo = [
            'user_id' => $user->id,
            'avatar_url' => $user->avatar,
            'has_avatar' => !empty($user->avatar),
            'gravatar_url' => $this->getGravatarUrl($user->email),
            'initials' => $this->generateInitials($user->name),
            'avatar_color' => $this->generateAvatarColor($user->name)
        ];

        // Add media library info if available
        $avatarMedia = $user->getFirstMedia('avatars');
        if ($avatarMedia) {
            $avatarInfo['media'] = [
                'id' => $avatarMedia->id,
                'file_name' => $avatarMedia->file_name,
                'mime_type' => $avatarMedia->mime_type,
                'size' => $avatarMedia->size,
                'url' => $avatarMedia->getUrl(),
                'thumbnail_url' => $avatarMedia->getUrl('thumb'),
                'created_at' => $avatarMedia->created_at?->format('Y-m-d H:i:s')
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $avatarInfo
        ]);
    }

    /**
     * Generate Gravatar URL
     */
    private function getGravatarUrl(string $email, int $size = 80): string
    {
        $hash = md5(strtolower(trim($email)));
        return "https://www.gravatar.com/avatar/{$hash}?s={$size}&d=mp";
    }

    /**
     * Generate initials from name
     */
    private function generateInitials(string $name): string
    {
        $names = explode(' ', trim($name));

        if (count($names) === 0) return '?';
        if (count($names) === 1) return strtoupper(substr($names[0], 0, 1));

        $firstInitial = substr($names[0], 0, 1);
        $lastInitial = substr(end($names), 0, 1);

        return strtoupper($firstInitial . $lastInitial);
    }

    /**
     * Generate avatar color based on name
     */
    private function generateAvatarColor(string $name): string
    {
        $colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
            '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
            '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D2B4DE'
        ];

        $hash = 0;
        for ($i = 0; $i < strlen($name); $i++) {
            $hash = ord($name[$i]) + (($hash << 5) - $hash);
        }

        return $colors[abs($hash) % count($colors)];
    }

    /**
     * Generate avatar using Laravolt/Avatar
     */
    public function generateLaravolt(Request $request): JsonResponse
    {
        $request->validate([
            'size' => 'sometimes|integer|min:50|max:500',
            'background' => 'sometimes|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'foreground' => 'sometimes|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'fontSize' => 'sometimes|integer|min:10|max:200',
        ]);

        try {
            $user = Auth::user();
            $options = $request->only(['size', 'background', 'foreground', 'fontSize']);

            // Generate custom Laravolt avatar
            $avatarUrl = $user->generateCustomLaravoltAvatar($options);

            // Log activity
            activity()
                ->causedBy($user)
                ->performedOn($user)
                ->withProperties([
                    'avatar_url' => $avatarUrl,
                    'options' => $options,
                    'type' => 'laravolt_generated'
                ])
                ->log('Laravolt avatar generated');

            return response()->json([
                'success' => true,
                'message' => 'Avatar generated successfully',
                'avatar_url' => $avatarUrl,
                'type' => 'laravolt',
                'user' => $user->fresh()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate avatar: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get Laravolt avatar as base64
     */
    public function getLaravoltBase64(Request $request): JsonResponse
    {
        $request->validate([
            'size' => 'sometimes|integer|min:50|max:500',
        ]);

        try {
            $user = Auth::user();
            $size = $request->input('size', 100);

            $base64Avatar = $user->getLaravoltAvatarBase64($size);

            return response()->json([
                'success' => true,
                'avatar_base64' => $base64Avatar,
                'size' => $size
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate base64 avatar: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Set Laravolt generated avatar as user avatar
     */
    public function setLaravoltAsAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'size' => 'sometimes|integer|min:50|max:500',
            'background' => 'sometimes|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'foreground' => 'sometimes|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'fontSize' => 'sometimes|integer|min:10|max:200',
        ]);

        try {
            $user = Auth::user();
            $options = $request->only(['size', 'background', 'foreground', 'fontSize']);

            // Remove old avatar if exists
            if ($user->avatar) {
                $this->removeOldAvatar($user->avatar);
            }

            // Generate and set Laravolt avatar
            $avatarUrl = $user->generateCustomLaravoltAvatar($options);
            $user->update(['avatar' => $avatarUrl]);

            // Log activity
            activity()
                ->causedBy($user)
                ->performedOn($user)
                ->withProperties([
                    'avatar_url' => $avatarUrl,
                    'options' => $options,
                    'type' => 'laravolt_set_as_avatar'
                ])
                ->log('Laravolt avatar set as user avatar');

            return response()->json([
                'success' => true,
                'message' => 'Laravolt avatar set successfully',
                'avatar_url' => $avatarUrl,
                'user' => $user->fresh()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to set Laravolt avatar: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Clear generated Laravolt avatars
     */
    public function clearGeneratedAvatars(): JsonResponse
    {
        try {
            $user = Auth::user();
            $user->clearGeneratedAvatars();

            // Log activity
            activity()
                ->causedBy($user)
                ->performedOn($user)
                ->log('Generated avatars cleared');

            return response()->json([
                'success' => true,
                'message' => 'Generated avatars cleared successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to clear generated avatars: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove old avatar file from storage
     */
    private function removeOldAvatar(string $avatarUrl): void
    {
        // Only remove if it's a local file
        if (str_contains($avatarUrl, config('app.url'))) {
            $path = str_replace(config('app.url') . '/storage/', '', $avatarUrl);
            Storage::disk('public')->delete($path);
        }
    }

    /**
     * Validate image file
     */
    private function validateImageFile($file): bool
    {
        $allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        return in_array($file->getMimeType(), $allowedMimes);
    }

    /**
     * Get optimized image dimensions
     */
    private function getOptimizedDimensions(int $width, int $height, int $maxSize = 300): array
    {
        if ($width <= $maxSize && $height <= $maxSize) {
            return [$width, $height];
        }

        $ratio = min($maxSize / $width, $maxSize / $height);
        return [
            (int) round($width * $ratio),
            (int) round($height * $ratio)
        ];
    }
}
