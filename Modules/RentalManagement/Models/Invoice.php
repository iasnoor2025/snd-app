<?php

namespace Modules\RentalManagement\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Invoice extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'booking_id',
        'payment_id',
        'invoice_number',
        'customer_id',
        'amount',
        'status',
        'issue_date',
        'due_date',
        'items',
        'metadata',
    ];

    protected $casts = [
        'amount' => 'float',
        'issue_date' => 'datetime',
        'due_date' => 'datetime',
        'items' => 'array',
        'metadata' => 'array',
    ];

    /**
     * Get the booking associated with the invoice
     */
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    /**
     * Get the payment associated with the invoice
     */
    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    /**
     * Get the customer associated with the invoice
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Get the items associated with the invoice
     */
    public function items()
    {
        return $this->hasMany(\Modules\RentalManagement\Domain\Models\InvoiceItem::class, 'invoice_id');
    }
}
