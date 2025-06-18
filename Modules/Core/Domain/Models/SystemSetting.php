<?php

namespace Modules\Core\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Carbon\Carbon;

class SystemSetting extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'key',
        'value',
        'type',
        'category',
        'description',
        'is_public',
        'is_encrypted'
    ];

    protected $casts = [
        'is_public' => 'boolean',
        'is_encrypted' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime'
    ];

    protected $hidden = [
        'deleted_at'
    ];

    /**
     * Get the table associated with the model.
     */
    public function getTable(): string
    {
        return 'system_settings';
    }

    /**
     * Scope to get public settings only
     */
    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    /**
     * Scope to get settings by category
     */
    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Scope to get settings by type
     */
    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Get the typed value of the setting
     */
    public function getTypedValueAttribute()
    {
        return $this->castValue($this->value, $this->type);
    }

    /**
     * Set the value attribute with proper serialization
     */
    public function setValueAttribute($value)
    {
        if ($this->is_encrypted) {
            $this->attributes['value'] = encrypt($this->serializeValue($value));
        } else {
            $this->attributes['value'] = $this->serializeValue($value);
        }
    }

    /**
     * Get the value attribute with proper deserialization
     */
    public function getValueAttribute($value)
    {
        if ($this->is_encrypted) {
            try {
                $value = decrypt($value);
            } catch (\Exception $e) {
                // If decryption fails, return the original value
                return $value;
            }
        }

        return $this->castValue($value, $this->type);
    }

    /**
     * Get the raw value without casting
     */
    public function getRawValue(): string
    {
        $value = $this->attributes['value'] ?? '';

        if ($this->is_encrypted) {
            try {
                return decrypt($value);
            } catch (\Exception $e) {
                return $value;
            }
        }

        return $value;
    }

    /**
     * Check if the setting is editable
     */
    public function isEditable(): bool
    {
        // Some system-critical settings should not be editable via UI
        $nonEditableKeys = [
            'app_key',
            'database_url',
            'redis_url',
            'mail_password',
            'aws_secret_access_key'
        ];

        return !in_array($this->key, $nonEditableKeys);
    }

    /**
     * Check if the setting requires restart
     */
    public function requiresRestart(): bool
    {
        $restartRequiredKeys = [
            'cache_driver',
            'session_driver',
            'queue_driver',
            'mail_driver',
            'database_connection'
        ];

        return in_array($this->key, $restartRequiredKeys);
    }

    /**
     * Get validation rules for the setting
     */
    public function getValidationRules(): array
    {
        $rules = ['required'];

        switch ($this->type) {
            case 'boolean':
                $rules[] = 'boolean';
                break;
            case 'integer':
                $rules[] = 'integer';
                if ($this->key === 'pagination_size') {
                    $rules[] = 'min:1|max:100';
                } elseif ($this->key === 'session_timeout') {
                    $rules[] = 'min:5|max:1440';
                } elseif (str_contains($this->key, 'retention_days')) {
                    $rules[] = 'min:1|max:365';
                }
                break;
            case 'float':
                $rules[] = 'numeric';
                break;
            case 'string':
                $rules[] = 'string';
                if ($this->key === 'currency') {
                    $rules[] = 'size:3';
                } elseif ($this->key === 'default_language') {
                    $rules[] = 'size:2';
                } elseif (str_contains($this->key, 'email')) {
                    $rules[] = 'email';
                } elseif (str_contains($this->key, 'url')) {
                    $rules[] = 'url';
                }
                break;
            case 'array':
            case 'json':
                $rules[] = 'array';
                break;
        }

        return $rules;
    }

    /**
     * Get the display name for the setting
     */
    public function getDisplayNameAttribute(): string
    {
        return $this->description ?: ucwords(str_replace('_', ' ', $this->key));
    }

    /**
     * Get the category display name
     */
    public function getCategoryDisplayNameAttribute(): string
    {
        return ucwords(str_replace('_', ' ', $this->category));
    }

    /**
     * Cast value to appropriate type
     */
    private function castValue($value, string $type)
    {
        if ($value === null) {
            return null;
        }

        return match ($type) {
            'boolean' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
            'integer' => (int) $value,
            'float' => (float) $value,
            'array', 'json' => is_string($value) ? json_decode($value, true) : $value,
            default => (string) $value
        };
    }

    /**
     * Serialize value for storage
     */
    private function serializeValue($value): string
    {
        if (is_array($value) || is_object($value)) {
            return json_encode($value);
        }

        if (is_bool($value)) {
            return $value ? '1' : '0';
        }

        return (string) $value;
    }

    /**
     * Get settings grouped by category
     */
    public static function getGroupedSettings(): array
    {
        return static::all()
            ->groupBy('category')
            ->map(function ($settings) {
                return $settings->keyBy('key');
            })
            ->toArray();
    }

    /**
     * Get a setting value by key
     */
    public static function getValue(string $key, $default = null)
    {
        $setting = static::where('key', $key)->first();

        return $setting ? $setting->typed_value : $default;
    }

    /**
     * Set a setting value by key
     */
    public static function setValue(string $key, $value, string $category = 'general', string $type = null): self
    {
        $type = $type ?: static::inferType($value);

        return static::updateOrCreate(
            ['key' => $key],
            [
                'value' => $value,
                'type' => $type,
                'category' => $category,
                'description' => ucwords(str_replace('_', ' ', $key))
            ]
        );
    }

    /**
     * Infer type from value
     */
    private static function inferType($value): string
    {
        if (is_bool($value)) {
            return 'boolean';
        }

        if (is_int($value)) {
            return 'integer';
        }

        if (is_float($value)) {
            return 'float';
        }

        if (is_array($value)) {
            return 'array';
        }

        return 'string';
    }

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        // Clear cache when settings are modified
        static::saved(function () {
            \Illuminate\Support\Facades\Cache::forget('system_settings');
        });

        static::deleted(function () {
            \Illuminate\Support\Facades\Cache::forget('system_settings');
        });
    }
}
