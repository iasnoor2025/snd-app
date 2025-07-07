<?php

namespace Modules\RentalManagement\Domain\Models;

use App\Enums\RentalStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\Core\Domain\Models\User;

class RentalStatusLog extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'rental_id',
        'from_status',
        'to_status',
        'changed_by',
        'notes',
    ];

    /**
     * Get the rental that owns the status log.
     */
    public function rental(): BelongsTo
    {
        return $this->belongsTo(Rental::class);
    }

    /**
     * Get the user who changed the status.
     */
    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }

    /**
     * Get the display name for the from status.
     */
    public function getFromStatusDisplayAttribute(): string
    {
        return $this->from_status->getDisplayName();
    }

    /**
     * Get the display name for the to status.
     */
    public function getToStatusDisplayAttribute(): string
    {
        return $this->to_status->getDisplayName();
    }
}






