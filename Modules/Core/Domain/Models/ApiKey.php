<?php

namespace Modules\Core\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\User;

class ApiKey extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'name',
        'key',
        'scopes',
        'expires_at',
        'last_used_at',
    ];

    protected $casts = [
        'scopes' => 'array',
        'expires_at' => 'datetime',
        'last_used_at' => 'datetime',
    ];

    protected $hidden = [
        'key',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($apiKey) {
            if (empty($apiKey->key)) {
                $apiKey->key = static::generateUniqueKey();
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function generateUniqueKey(): string
    {
        do {
            $key = 'sk_' . Str::random(32);
        } while (static::where('key', $key)->exists());

        return $key;
    }

    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    public function markAsUsed(): void
    {
        $this->update(['last_used_at' => now()]);
    }

    public function hasScope(string $scope): bool
    {
        return in_array('*', $this->scopes ?? []) || in_array($scope, $this->scopes ?? []);
    }
} 