<?php

namespace Modules\RentalManagement\Domain\Models;

use Modules\CustomerManagement\Domain\Models\Customer;
use Modules\EquipmentManagement\Traits\HandlesDocumentUploads;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Modules\EquipmentManagement\Traits\AutoLoadsRelations;

class Invoice extends Model implements HasMedia
{
    use HasFactory,
        HandlesDocumentUploads,
        InteractsWithMedia,
        AutoLoadsRelations;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'customer_id',
        'rental_id',
        'invoice_number',
        'invoice_date',
        'due_date',
        'subtotal',
        'discount_amount',
        'tax_amount',
        'total_amount',
        'paid_amount',
        'balance',
        'status',
        'notes',
        'created_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'invoice_date' => 'date',
        'due_date' => 'date',
        'subtotal' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'balance' => 'decimal:2',
    ];

    /**
     * Register media collections for the model
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('documents')
            ->useDisk('public');
    }

    /**
     * Get the customer that owns the invoice.
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Get the client that owns the invoice (for backward compatibility).
     */
    public function client(): BelongsTo
    {
        return $this->customer();
    }

    /**
     * Get the rental that owns the invoice.
     */
    public function rental(): BelongsTo
    {
        return $this->belongsTo(Rental::class);
    }

    /**
     * Get the invoice items for the invoice.
     */
    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class);
    }

    /**
     * Alias for items() for backward compatibility.
     */
    public function invoiceItems(): HasMany
    {
        return $this->items();
    }

    /**
     * Get the payments for the invoice.
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Get the balance due for the invoice.
     */
    public function getBalanceDueAttribute(): float
    {
        return $this->total_amount - $this->paid_amount;
    }

    /**
     * Check if the invoice is overdue.
     */
    public function getIsOverdueAttribute(): bool
    {
        return $this->status !== 'paid' && $this->due_date < now();
    }

    /**
     * Get the payment status for the invoice.
     */
    public function getPaymentStatusAttribute(): string
    {
        if ($this->paid_amount >= $this->total_amount) {
            return 'paid';
        } elseif ($this->paid_amount > 0) {
            return 'partial';
        } else {
            return 'unpaid';
        }
    }

    /**
     * Scope a query to filter invoices based on the provided criteria.
     */
    public function scopeFilter($query, array $filters)
    {
        $query->when($filters['search'] ?? null, function ($query, $search) {
            $query->where(function ($query) use ($search) {
                $query->where('invoice_number', 'like', '%' . $search . '%')
                    ->orWhereHas('customer', function ($query) use ($search) {
                        $query->where('company_name', 'like', '%' . $search . '%')
                            ->orWhere('contact_person', 'like', '%' . $search . '%');
                    });
            });
        });

        $query->when($filters['status'] ?? null, function ($query, $status) {
            $query->where('status', $status);
        });

        $query->when($filters['customer_id'] ?? null, function ($query, $customerId) {
            $query->where('customer_id', $customerId);
        });

        $query->when($filters['start_date'] ?? null, function ($query, $startDate) {
            $query->where('issue_date', '>=', $startDate);
        });

        $query->when($filters['end_date'] ?? null, function ($query, $endDate) {
            $query->where('issue_date', '<=', $endDate);
        });

        return $query;
    }
}






