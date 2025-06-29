<?php

namespace Modules\RentalManagement\Domain\Models;

use Illuminate\Database\Eloquent\Model;

class LoyaltyProgram extends Model
{
    protected $fillable = [
        'name',
        'description',
        'points_per_currency',
        'redeem_rate',
        'is_active',
    ];

    protected $casts = [
        'points_per_currency' => 'float',
        'redeem_rate' => 'float',
        'is_active' => 'boolean',
    ];
}
