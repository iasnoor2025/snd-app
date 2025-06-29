<?php

namespace Modules\Settings\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PaymentGatewaySetting extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'provider',
        'credentials',
        'endpoints',
        'is_active',
        'metadata',
    ];

    protected $casts = [
        'credentials' => 'array',
        'endpoints' => 'array',
        'is_active' => 'boolean',
        'metadata' => 'array',
    ];
}
