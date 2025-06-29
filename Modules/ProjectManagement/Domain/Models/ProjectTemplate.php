<?php

namespace Modules\ProjectManagement\Domain\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectTemplate extends Model
{
    protected $fillable = [
        'name',
        'description',
        'data',
    ];

    protected $casts = [
        'data' => 'array',
    ];
}
