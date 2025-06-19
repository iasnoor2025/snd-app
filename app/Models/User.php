<?php

namespace App\Models;

use Modules\Core\Domain\Models\User as CoreUser;
use Modules\Core\Traits\HasAvatar;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Laravel\Sanctum\HasApiTokens;

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
} 