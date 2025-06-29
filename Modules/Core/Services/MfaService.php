<?php

namespace Modules\Core\Services;

use PragmaRX\Google2FA\Google2FA;
use Modules\Core\Domain\Models\MfaConfiguration;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class MfaService
{
    protected Google2FA $google2fa;

    public function __construct()
    {
        $this->google2fa = new Google2FA();
    }

    public function setupMfa(User $user): array
    {
        $mfaConfig = $user->mfaConfiguration ?? new MfaConfiguration(['user_id' => $user->id]);
        
        if (!$mfaConfig->secret_key) {
            $mfaConfig->secret_key = $this->google2fa->generateSecretKey();
            $mfaConfig->save();
        }

        $qrCodeUrl = $this->google2fa->getQRCodeUrl(
            config('app.name'),
            $user->email,
            $mfaConfig->secret_key
        );

        return [
            'secret_key' => $mfaConfig->secret_key,
            'qr_code_url' => $qrCodeUrl,
            'backup_codes' => $mfaConfig->generateBackupCodes(),
        ];
    }

    public function verifyCode(User $user, string $code): bool
    {
        $mfaConfig = $user->mfaConfiguration;
        
        if (!$mfaConfig || !$mfaConfig->is_enabled) {
            return false;
        }

        // Check if it's a backup code
        if (strlen($code) > 6 && $mfaConfig->verifyBackupCode($code)) {
            $mfaConfig->markAsVerified();
            return true;
        }

        // Verify TOTP code
        $valid = $this->google2fa->verifyKey(
            $mfaConfig->secret_key,
            $code,
            config('auth.mfa.window', 1)
        );

        if ($valid) {
            $mfaConfig->markAsVerified();
        }

        return $valid;
    }

    public function enableMfa(User $user, string $code): bool
    {
        $mfaConfig = $user->mfaConfiguration;
        
        if (!$mfaConfig || !$mfaConfig->secret_key) {
            return false;
        }

        if ($this->google2fa->verifyKey($mfaConfig->secret_key, $code)) {
            $mfaConfig->is_enabled = true;
            $mfaConfig->markAsVerified();
            $mfaConfig->save();
            return true;
        }

        return false;
    }

    public function disableMfa(User $user): void
    {
        $mfaConfig = $user->mfaConfiguration;
        
        if ($mfaConfig) {
            $mfaConfig->is_enabled = false;
            $mfaConfig->secret_key = null;
            $mfaConfig->backup_codes = null;
            $mfaConfig->save();
        }
    }

    public function requiresVerification(User $user): bool
    {
        $mfaConfig = $user->mfaConfiguration;
        
        if (!$mfaConfig || !$mfaConfig->is_enabled) {
            return false;
        }

        $lastVerified = $mfaConfig->last_verified_at;
        $threshold = Carbon::now()->subMinutes(config('auth.mfa.timeout', 60));
        
        return !$lastVerified || $lastVerified->lt($threshold);
    }

    public function setRecoveryEmail(User $user, string $email, string $code): bool
    {
        $mfaConfig = $user->mfaConfiguration;
        
        if (!$mfaConfig || !$this->verifyCode($user, $code)) {
            return false;
        }

        $mfaConfig->recovery_email = [
            'email' => $email,
            'verified' => false,
            'token' => Hash::make(random_bytes(32)),
            'expires_at' => Carbon::now()->addDay(),
        ];
        $mfaConfig->save();

        // TODO: Send verification email
        return true;
    }
} 