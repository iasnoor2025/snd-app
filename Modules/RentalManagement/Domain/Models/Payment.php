<?php

namespace Modules\RentalManagement\Domain\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\Core\Domain\Models\User;

class Payment extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int;
use string>
     */
    protected $fillable = [
        'payment_number',
        'customer_id',
        'invoice_id',
        'amount',
        'payment_date',
        'payment_method',
        'reference_number',
        'notes',
        'receipt_path',
        'created_by'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'amount' => 'decimal:2',
        'payment_date' => 'date',
    ];

    /**
     * Get the rental that owns the payment.
     */
    public function rental(): BelongsTo
    {
        return $this->belongsTo(Rental::class);
    }

    /**
     * Get the customer that owns the payment.
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Get the client that owns the payment (for backward compatibility).
     */
    public function client(): BelongsTo
    {
        return $this->customer();
    }

    /**
     * Get the user who created the payment.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the receipt URL for the payment.
     */
    public function getReceiptUrlAttribute(): ?string
    {
        if (!$this->receipt_path) {
            return null;
        }

        return asset('storage/' . $this->receipt_path);
    }

    /**
     * Get the status badge for the payment.
     */
    public function getStatusBadgeAttribute(): array
    {
        return match ($this->status) {
            'completed' => [
                'class' => 'bg-green-100 text-green-700',
                'icon' => 'check-circle',
                'text' => 'Completed'
            ],
            'pending' => [
                'class' => 'bg-yellow-100 text-yellow-700',
                'icon' => 'clock',
                'text' => 'Pending'
            ],
            'failed' => [
                'class' => 'bg-red-100 text-red-700',
                'icon' => 'x-circle',
                'text' => 'Failed'
            ],
            default => [
                'class' => 'bg-gray-100 text-gray-700',
                'icon' => 'circle',
                'text' => ucfirst($this->status)
            ]
        };
    }
}






