<?php

namespace Modules\EquipmentManagement\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Supplier extends Model
{
    protected $fillable = [
        'name',
        'contact_name',
        'email',
        'phone',
        'address',
        'notes',
    ];

    public function equipment(): HasMany
    {
        return $this->hasMany(Equipment::class);
    }
}
