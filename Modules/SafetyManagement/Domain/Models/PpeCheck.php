<?php

namespace Modules\SafetyManagement\Domain\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class PpeCheck extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'equipment_id', 'user_id', 'check_date', 'status', 'notes'
    ];

    protected $dates = ['check_date'];

    public function equipment(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Equipment::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class);
    }

    public function equipments(): BelongsToMany
    {
        return $this->belongsToMany(\App\Models\Equipment::class, 'ppe_check_equipment');
    }
}
