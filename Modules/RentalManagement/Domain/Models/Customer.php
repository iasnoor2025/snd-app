<?php

namespace Modules\RentalManagement\Domain\Models;

use Modules\EquipmentManagement\Traits\HandlesDocumentUploads;
use Modules\EquipmentManagement\Traits\AutoLoadsRelations;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Modules\Core\Traits\HasAvatar;
use Modules\Core\Domain\Models\User;

class Customer extends Model implements HasMedia
{
    use HasFactory,
        HandlesDocumentUploads,
        LogsActivity,
        AutoLoadsRelations,
        InteractsWithMedia,
        HasAvatar;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'customers'; // Updated to use customers table

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'company_name',
        'contact_person',
        'email',
        'phone',
        'address',
        'city',
        'state',
        'postal_code',
        'country',
        'website',
        'tax_number',
        'credit_limit',
        'payment_terms',
        'notes',
        'is_active'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'credit_limit' => 'decimal:2',
        'is_active' => 'boolean',
        'settings' => 'array'
    ];

    protected $attributes = [
        'is_active' => true
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
        // Register avatar conversions from HasAvatar trait
        $this->registerAvatarMediaConversions($media);

        // Add customer-specific conversions
        $this->addMediaConversion('document-thumb')
            ->width(200)
            ->height(200)
            ->nonQueued()
            ->performOnCollections('documents');
    }

    /**
     * Activity log options
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['company_name', 'contact_person', 'email', 'phone', 'is_active'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    /**
     * Get the rentals for the customer
     */
    public function rentals(): HasMany
    {
        return $this->hasMany(Rental::class, 'customer_id');
    }

    /**
     * Get the invoices for the customer
     */
    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class, 'customer_id');
    }

    /**
     * Get the payments for the customer
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'customer_id');
    }

    /**
     * Get the full address of the customer
     */
    public function getFullAddressAttribute(): string
    {
        $parts = array_filter([
            $this->address,
            $this->city,
            $this->state,
            $this->postal_code,
            $this->country,
        ]);

        return implode(', ', $parts);
    }

    /**
     * Get the user associated with the customer.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}






