<?php

namespace Modules\SafetyManagement\Domain\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SafetyAction extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'incident_id', 'assigned_to', 'action', 'due_date', 'completed_at', 'status'
    ];

    protected $dates = ['due_date', 'completed_at'];

    public function incident(): BelongsTo
    {
        return $this->belongsTo(Incident::class);
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'assigned_to');
    }
}
