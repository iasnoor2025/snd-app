<?php

namespace App\Models;

use Modules\Core\Domain\Models\User as CoreUser;
use Modules\Core\Domain\Models\MfaConfiguration;
use Modules\Core\Domain\Models\ApiKey;
use Modules\Core\Traits\HasAvatar;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Modules\Core\Services\MfaService;
use Modules\Core\Domain\Models\DeviceSession;

class User extends CoreUser implements HasMedia
{
    use HasApiTokens, HasAvatar, InteractsWithMedia;

    /**
     * Additional fillable attributes for the main User model
     *
     * @var array<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'avatar',
        'is_active',
        'last_login_at',
        'locale',
        'password_changed_at',
        'is_customer'
    ];

    /**
     * Additional hidden attributes for the main User model
     *
     * @var array<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'mfa_configuration',
    ];

    /**
     * Register media conversions for the model
     */
    public function registerMediaConversions(?Media $media = null): void
    {
        // Register avatar conversions from HasAvatar trait
        $this->registerAvatarMediaConversions($media);
    }

    /**
     * Define the avatar media collection
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('avatars')
            ->singleFile()
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
    }

    /**
     * Get the MFA configuration for the user
     */
    public function mfaConfiguration(): HasOne
    {
        return $this->hasOne(MfaConfiguration::class);
    }

    /**
     * Check if MFA is enabled for the user
     */
    public function hasMfaEnabled(): bool
    {
        return $this->mfaConfiguration?->is_enabled ?? false;
    }

    /**
     * Get the API keys for the user
     */
    public function apiKeys(): HasMany
    {
        return $this->hasMany(ApiKey::class);
    }

    public function requiresMfaVerification(): bool
    {
        return app(MfaService::class)->requiresVerification($this);
    }

    public function deviceSessions(): HasMany
    {
        return $this->hasMany(DeviceSession::class);
    }
} 