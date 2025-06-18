<?php

namespace Modules\Core\Domain\Models;

use Illuminate\Database\Eloquent\Model;

class SystemMetric extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'cpu_usage',
        'memory_usage',
        'disk_usage',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'cpu_usage' => 'float',
        'memory_usage' => 'float',
        'disk_usage' => 'float',
    ];
}



