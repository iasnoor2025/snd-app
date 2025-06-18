<?php

namespace Modules\AuditCompliance\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;
use Modules\Core\Domain\Models\User;

class ConsentRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'email',
        'consent_type',
        'consent_given',
        'purpose',
        'legal_basis',
        'ip_address',
        'user_agent',
        'consent_details',
        'consent_date',
        'expiry_date',
        'is_active',
    ];

    protected $casts = [
        'consent_given' => 'boolean',
        'consent_details' => 'array',
        'consent_date' => 'datetime',
        'expiry_date' => 'datetime',
        'is_active' => 'boolean',
    ];

    /**
     * Get the user associated with this consent.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope to get active consents.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get consents by type.
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('consent_type', $type);
    }

    /**
     * Scope to get consents for a specific email.
     */
    public function scopeForEmail($query, string $email)
    {
        return $query->where('email', $email);
    }

    /**
     * Scope to get consents for a specific user.
     */
    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope to get given consents.
     */
    public function scopeGiven($query)
    {
        return $query->where('consent_given', true);
    }

    /**
     * Scope to get withdrawn consents.
     */
    public function scopeWithdrawn($query)
    {
        return $query->where('consent_given', false);
    }

    /**
     * Scope to get expired consents.
     */
    public function scopeExpired($query)
    {
        return $query->where('expiry_date', '<', Carbon::now())
                    ->whereNotNull('expiry_date');
    }

    /**
     * Check if the consent is expired.
     */
    public function isExpired(): bool
    {
        return $this->expiry_date && $this->expiry_date->isPast();
    }

    /**
     * Check if the consent is valid (given, active, and not expired).
     */
    public function isValid(): bool
    {
        return $this->consent_given &&
               $this->is_active &&
               !$this->isExpired();
    }

    /**
     * Withdraw the consent.
     */
    public function withdraw(string $ipAddress = null, string $userAgent = null): void
    {
        // Create a new record for the withdrawal
        static::create([
            'user_id' => $this->user_id,
            'email' => $this->email,
            'consent_type' => $this->consent_type,
            'consent_given' => false,
            'purpose' => $this->purpose,
            'legal_basis' => 'Consent withdrawn',
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
            'consent_date' => Carbon::now(),
            'is_active' => true,
        ]);

        // Deactivate the current consent
        $this->update(['is_active' => false]);
    }

    /**
     * Renew the consent.
     */
    public function renew(Carbon $expiryDate = null, string $ipAddress = null, string $userAgent = null): void
    {
        // Create a new record for the renewal
        static::create([
            'user_id' => $this->user_id,
            'email' => $this->email,
            'consent_type' => $this->consent_type,
            'consent_given' => true,
            'purpose' => $this->purpose,
            'legal_basis' => $this->legal_basis,
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
            'consent_date' => Carbon::now(),
            'expiry_date' => $expiryDate,
            'is_active' => true,
        ]);

        // Deactivate the current consent
        $this->update(['is_active' => false]);
    }

    /**
     * Get the latest consent for a user and type.
     */
    public static function getLatestConsent(string $email, string $consentType): ?self
    {
        return static::where('email', $email)
                    ->where('consent_type', $consentType)
                    ->active()
                    ->latest('consent_date')
                    ->first();
    }

    /**
     * Check if a user has given consent for a specific type.
     */
    public static function hasConsent(string $email, string $consentType): bool
    {
        $consent = static::getLatestConsent($email, $consentType);
        return $consent && $consent->isValid();
    }
}
