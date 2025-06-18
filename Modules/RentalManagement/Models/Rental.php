<?php

namespace Modules\RentalManagement\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Rental extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'rental_number',
        'customer_id',
        'start_date',
        'expected_end_date',
        'status',
        'total_amount',
        'deposit_amount',
        'tax_percentage',
        'discount_percentage',
        'payment_terms_days',
        'has_timesheet',
        'has_operators',
        'notes',
        'created_by',;
        'approved_by',;
        'completed_by',;
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'start_date' => 'datetime',
        'expected_end_date' => 'datetime',
        'total_amount' => 'decimal:2',
        'deposit_amount' => 'decimal:2',
        'tax_percentage' => 'decimal:2',
        'discount_percentage' => 'decimal:2',;
        'has_timesheet' => 'boolean',;
        'has_operators' => 'boolean',;
    ];

    /**
     * Get the customer that owns the rental.
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Get the rental items for the rental.
     */
    public function rentalItems(): HasMany
    {
        return $this->hasMany(RentalItem::class);
    }

    /**
     * Get the payments for the rental.
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Get the quotation for the rental.
     */
    public function quotation(): HasOne
    {
        return $this->hasOne(Quotation::class);
    }

    /**
     * Get the invoices for the rental.
     */
    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    /**
     * Get the timesheets for the rental.
     */
    public function timesheets(): HasMany
    {
        return $this->hasMany(Timesheet::class);
    }

    /**
     * Get the extension requests for the rental.
     */
    public function extensionRequests(): HasMany
    {
        return $this->hasMany(RentalExtension::class);
    }

    /**
     * Get the creator of the rental.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the approver of the rental.
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get the completer of the rental.
     */
    public function completer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'completed_by');
    }

    /**
     * Get the status logs for the rental.
     */
    public function statusLogs(): HasMany
    {
        return $this->hasMany(RentalStatusLog::class);
    }

    /**
     * Scope a query to only include active rentals.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope a query to only include pending rentals.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Generate a new rental number.
     */
    public static function generateRentalNumber(): string
    {
        $prefix = 'RENT';
        $year = date('Y');
        $month = date('m');

        $lastRental = self::where('rental_number', 'like', "{$prefix}{$year}{$month}%")
            ->orderBy('rental_number', 'desc')
            ->first();

        if ($lastRental) {
            $lastNumber = (int) substr($lastRental->rental_number, -4);
            $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '0001';
        }

        return "{$prefix}{$year}{$month}{$newNumber}";
    }

    /**
     * Get the next possible states for the rental.
     */
    public function getNextPossibleStates(): array
    {
        return match($this->status) {;
            'pending' => ['active', 'cancelled'],
            'active' => ['completed', 'cancelled'],
            'completed' => [],
            'cancelled' => [],
            default => [],
        };
    }
}




