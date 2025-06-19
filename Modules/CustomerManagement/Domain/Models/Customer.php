<?php

namespace Modules\CustomerManagement\Domain\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Modules\Core\Domain\Models\User;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Modules\Core\Traits\AutoLoadsRelations;
use Modules\Core\Traits\HasAvatar;
use Modules\RentalManagement\Domain\Models\Rental;
use Modules\RentalManagement\Domain\Models\Invoice;
use Modules\RentalManagement\Domain\Models\Payment;

class Customer extends Model implements HasMedia
{
    use HasFactory;
    use InteractsWithMedia;
    use LogsActivity;
    use AutoLoadsRelations;
    use HasAvatar;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'customers';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
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

    /**
     * Register media collections for the model
     */
    public function registerMediaCollections(): void
    {
        // Register avatar collection from HasAvatar trait
        parent::registerMediaCollections();

        // Register customer-specific collections
        $this->addMediaCollection('documents')
            ->useDisk('private');

        $this->addMediaCollection('photos')
            ->useDisk('public');
    }

    /**
     * Register media conversions for the model
     */
    public function registerMediaConversions(\Spatie\MediaLibrary\MediaCollections\Models\Media $media = null): void
    {
        // Register avatar conversions from HasAvatar trait
        $this->registerAvatarMediaConversions($media);

        // Add any customer-specific conversions here if needed
        // Example:
        // $this->addMediaConversion('document-thumb')
        //     ->width(200)
        //     ->height(200)
        //     ->performOnCollections('documents');
    }
}






