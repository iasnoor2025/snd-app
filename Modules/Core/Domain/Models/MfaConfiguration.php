<?php

namespace Modules\Core\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;

class MfaConfiguration extends Model
{
    protected $fillable = [
        'user_id',
        'secret_key',
        'is_enabled',
        'backup_codes',
        'last_verified_at',
        'recovery_email',
    ];

    protected $casts = [
        'is_enabled' => 'boolean',
        'backup_codes' => 'array',
        'last_verified_at' => 'datetime',
        'recovery_email' => 'array',
    ];

    protected $hidden = [
        'secret_key',
        'backup_codes',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function generateBackupCodes(): array
    {
        $codes = [];
        for ($i = 0; $i < 8; $i++) {
            $codes[] = sprintf('%s-%s', 
                bin2hex(random_bytes(4)),
                bin2hex(random_bytes(4))
            );
        }
        
        $this->backup_codes = $codes;
        $this->save();
        
        return $codes;
    }

    public function verifyBackupCode(string $code): bool
    {
        $codes = $this->backup_codes ?? [];
        $index = array_search($code, $codes);
        
        if ($index !== false) {
            unset($codes[$index]);
            $this->backup_codes = array_values($codes);
            $this->save();
            return true;
        }
        
        return false;
    }

    public function markAsVerified(): void
    {
        $this->last_verified_at = now();
        $this->save();
    }
} 