<?php

namespace Modules\Settings\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SsoSetting extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'provider',
        'client_id',
        'client_secret',
        'discovery_url',
        'redirect_uri',
        'scopes',
        'is_active',
        'metadata',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'metadata' => 'array',
    ];
}
