<?php

namespace Modules\SafetyManagement\Domain\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Inspection extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'module_id', 'scheduled_date', 'completed_date', 'findings', 'status'
    ];

    protected $dates = ['scheduled_date', 'completed_date'];

    public function inspectionItems(): HasMany
    {
        return $this->hasMany(InspectionItem::class);
    }

    public function module(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Module::class, 'module_id');
    }
}
