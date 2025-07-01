<?php

namespace Modules\Core\Domain\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;
use Laravel\Sanctum\HasApiTokens;
use Modules\EmployeeManagement\Domain\Models\Employee;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles, HasApiTokens;

    /**
     * The guard that the model should use.
     *
     * @var string
     */
    protected $guard_name = 'web';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'is_active',
        'last_login_at',
        'locale',
        'provider', // Social login provider
        'provider_id', // Social login provider user id
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'tokens'
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_active' => 'boolean',
        'last_login_at' => 'datetime',
        'is_customer' => 'boolean',
        'password_changed_at' => 'datetime',
        'locale' => 'string'
    ];

    /**
     * Check if user is an admin
     *
     * Using Spatie's hasRole method
     */
    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    /**
     * Get the employee associated with the user
     */
    public function employee(): HasOne
    {
        return $this->hasOne(Employee::class);
    }

    /**
     * Get the customer record associated with this user.
     */
    public function customer()
    {
        return $this->hasOne(Customer::class);
    }

    /**
     * Resolve the route binding for the model.
     *
     * @param  mixed  $value
     * @param  string|null  $field
     * @return \Illuminate\Database\Eloquent\Model|null
     */
    public function resolveRouteBinding($value, $field = null)
    {
        return $this->where($field ?? $this->getRouteKeyName(), (int) $value)->first();
    }

    /**
     * Create a new API token for the user.
     *
     * @param string $name
     * @param array $abilities
     * @param \Illuminate\Support\Carbon|null $expiresAt
     * @return \Laravel\Sanctum\NewAccessToken
     */
    public function createApiToken($name, array $abilities = ['*'], $expiresAt = null)
    {
        return $this->createToken($name, $abilities, $expiresAt);
    }

    /**
     * Revoke all tokens for the user.
     *
     * @return void
     */
    public function revokeAllTokens()
    {
        if (method_exists($this, 'tokens')) {
            $this->tokens()->delete();
        }
    }

    /**
     * Check if user's password has expired.
     *
     * @return bool
     */
    public function passwordExpired()
    {
        if (!$this->password_changed_at) {
            return true;
        }

        // Password expiration period (90 days)
        $expirationPeriod = config('auth.password_expiration_days', 90);

        return $this->password_changed_at->addDays($expirationPeriod)->isPast();
    }

    /**
     * Update the user's last login timestamp.
     *
     * @return void
     */
    public function updateLastLogin()
    {
        $this->last_login_at = now();
        $this->save();
    }

    /**
     * Create a new factory instance for the model.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    protected static function newFactory()
    {
        return \Modules\Core\Database\factories\UserFactory::new();
    }
}






