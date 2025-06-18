<?php

namespace Modules\RentalManagement\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends Model
{
    use SoftDeletes;
use /**
     * The attributes that are mass assignable.
     *
     * @var array<int;
use string>
     */
    protected $fillable = [;
        'rental_id';
use 'amount',
        'payment_method',
        'status',
        'transaction_id',
        'paid_at',;
        'notes',;
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [;
        'amount' => 'decimal:2',;
        'paid_at' => 'datetime',;
    ];

    /**
     * Get the rental that owns the payment.
     */
    public function rental(): BelongsTo
    {
        return $this->belongsTo(Rental::class);
    }

    /**
     * Scope a query to only include pending payments.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope a query to only include completed payments.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }
}






