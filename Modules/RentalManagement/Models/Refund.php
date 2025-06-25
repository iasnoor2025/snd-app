<?php

namespace Modules\RentalManagement\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Refund extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'payment_id',
        'booking_id',
        'amount',
        'reason',
        'status',
        'refund_date',
        'processed_by',
        'transaction_id',
        'metadata',
    ];

    protected $casts = [
        'amount' => 'float',
        'refund_date' => 'datetime',
        'metadata' => 'array',
    ];

    /**
     * Get the payment associated with the refund
     */
    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    /**
     * Get the booking associated with the refund
     */
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    /**
     * Get the user who processed the refund
     */
    public function processedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }
} 