<?php

namespace Modules\EmployeeManagement\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class EmployeeDocument extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'employee_id',
        'type',
        'file_path',
        'expiry_date',
        'renewal_status',
        'metadata',
        'status',
        'last_validated_at',
        'validation_result',
    ];

    protected $casts = [
        'expiry_date' => 'datetime',
        'last_validated_at' => 'datetime',
        'metadata' => 'array',
        'validation_result' => 'array',
    ];

    /**
     * Get the employee that owns the document
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * Check if the document is expired
     */
    public function isExpired(): bool
    {
        return $this->expiry_date && $this->expiry_date->isPast();
    }

    /**
     * Check if the document is expiring soon
     */
    public function isExpiringSoon(int $days = 30): bool
    {
        return $this->expiry_date && 
            $this->expiry_date->isFuture() && 
            $this->expiry_date->diffInDays(now()) <= $days;
    }

    /**
     * Get the full URL to the document
     */
    public function getUrl(): string
    {
        return Storage::disk('secure')->url($this->file_path);
    }

    /**
     * Get the document content
     */
    public function getContent(): string
    {
        return Storage::disk('secure')->get($this->file_path);
    }

    /**
     * Delete the document file from storage when the model is deleted
     */
    protected static function boot()
    {
        parent::boot();

        static::deleting(function ($document) {
            Storage::disk('secure')->delete($document->file_path);
        });
    }

    /**
     * Scope a query to only include documents of a specific type
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope a query to only include active documents
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope a query to only include documents requiring renewal
     */
    public function scopeRequiringRenewal($query)
    {
        return $query->where('renewal_status', 'pending');
    }

    /**
     * Scope a query to only include expired documents
     */
    public function scopeExpired($query)
    {
        return $query->where('expiry_date', '<', now());
    }

    /**
     * Scope a query to only include documents expiring soon
     */
    public function scopeExpiringSoon($query, int $days = 30)
    {
        return $query->where('expiry_date', '<=', now()->addDays($days))
            ->where('expiry_date', '>', now());
    }
}