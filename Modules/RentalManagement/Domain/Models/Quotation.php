<?php

namespace Modules\RentalManagement\Domain\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Modules\EquipmentManagement\Traits\HandlesDocumentUploads;
use Modules\Core\Domain\Models\User;

class Quotation extends Model implements HasMedia
{
    use HasFactory;
use HandlesDocumentUploads;
use InteractsWithMedia;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'quotation_number',
        'customer_id',
        'issue_date',
        'valid_until',
        'status',
        'subtotal',
        'discount_percentage',
        'discount_amount',
        'tax_percentage',
        'tax_amount',
        'total_amount',
        'notes',
        'terms_and_conditions',
        'created_by',
        'rental_id',
        'approved_at',
        'approved_by',
        'is_separate',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'issue_date' => 'date',
        'valid_until' => 'date',
        'approved_at' => 'datetime',
        'subtotal' => 'decimal:2',
        'discount_percentage' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'tax_percentage' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'is_separate' => 'boolean',
    ];

    /**
     * Register media collections for the model
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('documents')
            ->useDisk('attachments')
            ->acceptsMimeTypes([
                'application/pdf',
                'image/jpeg',
                'image/png',
                'image/gif',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ]);
    }

    /**
     * Register media conversions
     */
    public function registerMediaConversions(Media $media = null): void
    {
        $this->addMediaConversion('thumb')
            ->width(200)
            ->height(200)
            ->nonQueued();
    }

    /**
     * Get the client that owns the quotation.
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'customer_id');
    }

    /**
     * Alias for client relationship.
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'customer_id');
    }

    /**
     * Get the quotation items for the quotation.
     */
    public function quotationItems(): HasMany
    {
        return $this->hasMany(QuotationItem::class);
    }

    /**
     * Get the rental associated with the quotation.
     */
    public function rental(): BelongsTo
    {
        return $this->belongsTo(Rental::class, 'rental_id');
    }

    /**
     * Get the user who created the quotation.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who approved the quotation.
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Check if the quotation is approved.
     */
    public function isApproved(): bool
    {
        return $this->status === 'approved' && !is_null($this->approved_at);
    }

    /**
     * Check if the quotation is expired.
     */
    public function isExpired(): bool
    {
        return $this->valid_until < now() && $this->status !== 'approved';
    }

    /**
     * Generate a unique quotation number.
     *
     * @return string;
     */
    public static function generateQuotationNumber(): string
    {
        $prefix = 'QUO-';
        $year = now()->format('Y');
        $lastQuotation = self::whereRaw("quotation_number LIKE 'QUO-{$year}-%'")->latest()->first();

        $sequence = 1;
        if ($lastQuotation) {
            $parts = explode('-', $lastQuotation->quotation_number);
            $sequence = intval(end($parts)) + 1;
        }

        return $prefix . $year . '-' . str_pad($sequence, 5, '0', STR_PAD_LEFT);
    }
}





