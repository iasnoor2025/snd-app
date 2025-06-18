<?php

namespace Modules\RentalManagement\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RentalExtensionRequest extends Model
{
    use HasFactory, SoftDeletes;
    protected $fillable = [
        'rental_id',
        'requested_days',
        'keep_operators',
        'status',
        'requested_by',
        'processed_by',
        'current_end_date',
        'new_end_date',
        'notes',
        'processed_at',
    ];

    protected $casts = [
        'keep_operators' => 'boolean',
        'current_end_date' => 'date',
        'new_end_date' => 'date',
        'processed_at' => 'datetime',
    ];

    public function rental(): BelongsTo
    {
        return $this->belongsTo(Rental::class);
    }

    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function processedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    public function requestedEquipment(): HasMany
    {
        return $this->hasMany(RentalExtensionRequestedEquipment::class);
    }

    public function isPending()
    {
        return $this->status === 'pending';
    }

    public function isApproved()
    {
        return $this->status === 'approved';
    }

    public function isRejected()
    {
        return $this->status === 'rejected';
    }
}






