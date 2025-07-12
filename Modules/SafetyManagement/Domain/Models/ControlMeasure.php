<?php

namespace Modules\SafetyManagement\Domain\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ControlMeasure extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'risk_id', 'description', 'implemented_at', 'status'
    ];

    protected $dates = ['implemented_at'];

    public function risk(): BelongsTo
    {
        return $this->belongsTo(Risk::class);
    }
}
