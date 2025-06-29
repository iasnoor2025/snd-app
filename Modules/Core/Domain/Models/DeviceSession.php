<?php

namespace Modules\Core\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\User;
use Carbon\Carbon;

class DeviceSession extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'device_name',
        'device_type',
        'browser',
        'platform',
        'ip_address',
        'location',
        'last_active_at',
        'mfa_verified_at',
        'is_remembered',
        'session_id',
        'metadata',
    ];

    protected $casts = [
        'last_active_at' => 'datetime',
        'mfa_verified_at' => 'datetime',
        'is_remembered' => 'boolean',
        'metadata' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function requiresMfaVerification(): bool
    {
        if (!$this->mfa_verified_at) {
            return true;
        }

        $threshold = Carbon::now()->subMinutes(config('auth.mfa.timeout', 60));
        return $this->mfa_verified_at->lt($threshold);
    }

    public function markAsVerified(): void
    {
        $this->update(['mfa_verified_at' => now()]);
    }

    public function updateActivity(): void
    {
        $this->update(['last_active_at' => now()]);
    }

    public function isActive(): bool
    {
        $threshold = Carbon::now()->subMinutes(config('session.lifetime', 120));
        return $this->last_active_at->gt($threshold);
    }

    public function getDeviceInfoAttribute(): array
    {
        return [
            'name' => $this->device_name,
            'type' => $this->device_type,
            'browser' => $this->browser,
            'platform' => $this->platform,
            'location' => $this->location,
            'last_active' => $this->last_active_at->diffForHumans(),
            'is_current' => $this->session_id === session()->getId(),
        ];
    }
} 