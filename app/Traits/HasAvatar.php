<?php

namespace App\Traits;

use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\MediaLibrary\HasMedia;
use Laravolt\Avatar\Facade as Avatar;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

trait HasAvatar
{
    use InteractsWithMedia;

    /**
     * Register media collections for avatar
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('avatars')
            ->singleFile()
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
    }

    /**
     * Register media conversions for avatar
     * This method will be called automatically if the model doesn't override it
     */
    public function registerAvatarMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('thumb')
            ->width(150)
            ->height(150)
            ->sharpen(10)
            ->quality(85)
            ->performOnCollections('avatars');

        $this->addMediaConversion('small')
            ->width(80)
            ->height(80)
            ->sharpen(10)
            ->quality(85)
            ->performOnCollections('avatars');

        $this->addMediaConversion('large')
            ->width(400)
            ->height(400)
            ->sharpen(10)
            ->quality(90)
            ->performOnCollections('avatars');
    }

    /**
     * Register media conversions for avatar
     * This method handles the collision with InteractsWithMedia trait
     */
    public function registerMediaConversions(?Media $media = null): void
    {
        // Call parent method if it exists (from InteractsWithMedia)
        if (method_exists(parent::class, 'registerMediaConversions')) {
            parent::registerMediaConversions($media);
        }

        // Register avatar-specific conversions
        $this->registerAvatarMediaConversions($media);
    }

    /**
     * Get avatar URL with fallback options
     */
    public function getAvatarUrlAttribute(): ?string
    {
        // First, check if avatar field is set (for URL-based avatars)
        if (!empty($this->attributes['avatar'])) {
            return $this->attributes['avatar'];
        }

        // Then check for media library avatar
        $avatarMedia = $this->getFirstMedia('avatars');
        if ($avatarMedia) {
            return $avatarMedia->getUrl();
        }

        // Generate avatar using Laravolt/Avatar as fallback
        return $this->generateLaravoltAvatar();
    }

    /**
     * Get avatar thumbnail URL
     */
    public function getAvatarThumbUrlAttribute(): ?string
    {
        $avatarMedia = $this->getFirstMedia('avatars');
        if ($avatarMedia) {
            return $avatarMedia->getUrl('thumb');
        }

        return $this->avatar_url;
    }

    /**
     * Get avatar small URL
     */
    public function getAvatarSmallUrlAttribute(): ?string
    {
        $avatarMedia = $this->getFirstMedia('avatars');
        if ($avatarMedia) {
            return $avatarMedia->getUrl('small');
        }

        return $this->avatar_url;
    }

    /**
     * Get avatar large URL
     */
    public function getAvatarLargeUrlAttribute(): ?string
    {
        $avatarMedia = $this->getFirstMedia('avatars');
        if ($avatarMedia) {
            return $avatarMedia->getUrl('large');
        }

        return $this->avatar_url;
    }

    /**
     * Get Gravatar URL
     */
    public function getGravatarUrlAttribute(): string
    {
        $hash = md5(strtolower(trim($this->email)));
        return "https://www.gravatar.com/avatar/{$hash}?s=200&d=mp";
    }

    /**
     * Get user initials for avatar fallback
     */
    public function getInitialsAttribute(): string
    {
        if (empty($this->name)) {
            return '?';
        }

        $names = explode(' ', trim($this->name));

        if (count($names) === 1) {
            return strtoupper(substr($names[0], 0, 1));
        }

        $firstInitial = substr($names[0], 0, 1);
        $lastInitial = substr(end($names), 0, 1);

        return strtoupper($firstInitial . $lastInitial);
    }

    /**
     * Get avatar color based on user name
     */
    public function getAvatarColorAttribute(): string
    {
        $colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
            '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
            '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D2B4DE'
        ];

        $name = $this->name ?? $this->email ?? 'default';
        $hash = 0;

        for ($i = 0; $i < strlen($name); $i++) {
            $hash = ord($name[$i]) + (($hash << 5) - $hash);
        }

        return $colors[abs($hash) % count($colors)];
    }

    /**
     * Get avatar data for frontend with Laravolt integration
     */
    public function getAvatarDataAttribute(): array
    {
        return [
            'url' => $this->avatar_url,
            'thumb' => $this->avatar_thumb_url,
            'small' => $this->avatar_small_url,
            'large' => $this->avatar_large_url,
            'gravatar' => $this->gravatar_url,
            'laravolt' => $this->generateLaravoltAvatar(),
            'laravolt_base64' => $this->getLaravoltAvatarBase64(),
            'initials' => $this->initials,
            'color' => $this->avatar_color,
            'has_avatar' => !empty($this->avatar_url),
            'has_custom_avatar' => !empty($this->attributes['avatar']) || $this->hasMedia('avatars'),
        ];
    }

    /**
     * Check if user has an avatar
     */
    public function hasAvatar(): bool
    {
        return !empty($this->avatar_url) || $this->hasMedia('avatars');
    }

    /**
     * Remove avatar
     */
    public function removeAvatar(): void
    {
        // Clear media library avatars
        $this->clearMediaCollection('avatars');

        // Clear avatar field
        $this->update(['avatar' => null]);
    }

    /**
     * Set avatar from file
     */
    public function setAvatarFromFile($file, bool $useMediaLibrary = true): string
    {
        if ($useMediaLibrary) {
            // Clear existing avatars
            $this->clearMediaCollection('avatars');

            // Add new avatar
            $media = $this->addMediaFromRequest('avatar')
                ->usingFileName('avatar_' . $this->id . '_' . time() . '.' . $file->getClientOriginalExtension())
                ->toMediaCollection('avatars');

            return $media->getUrl();
        } else {
            // Handle file upload manually
            $filename = 'avatar_' . $this->id . '_' . time() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('avatars', $filename, 'public');
            $url = \Storage::disk('public')->url($path);

            $this->update(['avatar' => $url]);

            return $url;
        }
    }

    /**
     * Set avatar from URL
     */
    public function setAvatarFromUrl(string $url): string
    {
        // Validate URL and download image
        $contents = file_get_contents($url);
        if (!$contents) {
            throw new \Exception('Unable to download image from URL');
        }

        // Generate filename
        $extension = pathinfo(parse_url($url, PHP_URL_PATH), PATHINFO_EXTENSION) ?: 'jpg';
        $filename = 'avatar_' . $this->id . '_' . time() . '.' . $extension;
        $path = 'avatars/' . $filename;

        // Store image
        Storage::disk('public')->put($path, $contents);
        $avatarUrl = Storage::disk('public')->url($path);

        // Update avatar
        $this->update(['avatar' => $avatarUrl]);

        return $avatarUrl;
    }

    /**
     * Generate avatar using Laravolt/Avatar package
     */
    public function generateLaravoltAvatar(int $size = 100): string
    {
        $name = $this->name ?? $this->email ?? 'User';
        $filename = 'laravolt_avatar_' . $this->id . '_' . md5($name) . '.png';
        $path = 'avatars/generated/' . $filename;

        // Check if avatar already exists
        if (Storage::disk('public')->exists($path)) {
            return Storage::disk('public')->url($path);
        }

        // Generate avatar using Laravolt/Avatar
        $avatar = Avatar::create($name)
            ->setDimension($size, $size)
            ->setFontSize($size * 0.4)
            ->getImageObject();

        // Save avatar to storage
        $avatarData = $avatar->encode('png');
        Storage::disk('public')->put($path, $avatarData);

        return Storage::disk('public')->url($path);
    }

    /**
     * Generate avatar with custom options
     */
    public function generateCustomLaravoltAvatar(array $options = []): string
    {
        $name = $this->name ?? $this->email ?? 'User';
        $size = $options['size'] ?? 100;
        $shape = $options['shape'] ?? 'circle';
        $theme = $options['theme'] ?? 'colorful';

        $filename = 'laravolt_custom_' . $this->id . '_' . md5($name . serialize($options)) . '.png';
        $path = 'avatars/generated/' . $filename;

        // Check if avatar already exists
        if (Storage::disk('public')->exists($path)) {
            return Storage::disk('public')->url($path);
        }

        // Generate avatar with custom options
        $avatarBuilder = Avatar::create($name)
            ->setDimension($size, $size)
            ->setFontSize($size * 0.4);

        // Apply custom options
        if (isset($options['background'])) {
            $avatarBuilder->setBackground($options['background']);
        }

        if (isset($options['foreground'])) {
            $avatarBuilder->setForeground($options['foreground']);
        }

        if (isset($options['fontSize'])) {
            $avatarBuilder->setFontSize($options['fontSize']);
        }

        $avatar = $avatarBuilder->getImageObject();

        // Save avatar to storage
        $avatarData = $avatar->encode('png');
        Storage::disk('public')->put($path, $avatarData);

        return Storage::disk('public')->url($path);
    }

    /**
     * Get Laravolt avatar as base64 data URL
     */
    public function getLaravoltAvatarBase64(int $size = 100): string
    {
        $name = $this->name ?? $this->email ?? 'User';

        $avatar = Avatar::create($name)
            ->setDimension($size, $size)
            ->setFontSize($size * 0.4)
            ->getImageObject();

        $avatarData = $avatar->encode('png');
        return 'data:image/png;base64,' . base64_encode($avatarData);
    }

    /**
     * Clear generated Laravolt avatars
     */
    public function clearGeneratedAvatars(): void
    {
        $pattern = 'avatars/generated/laravolt_*_' . $this->id . '_*.png';
        $files = Storage::disk('public')->files('avatars/generated');

        foreach ($files as $file) {
            if (Str::contains($file, 'laravolt_') && Str::contains($file, '_' . $this->id . '_')) {
                Storage::disk('public')->delete($file);
            }
        }
    }
}
