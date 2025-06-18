<?php

namespace Modules\Core\Domain\Models;

use Illuminate\Database\Eloquent\Model;

class Location extends Model
{
    protected $fillable = [
        'name',
        'city',
        'state',
        'country',
    ];
}
