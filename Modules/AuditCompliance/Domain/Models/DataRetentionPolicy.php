<?php

namespace Modules\AuditCompliance\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Carbon\Carbon;

class DataRetentionPolicy extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'data_type',
        'retention_days',
        'auto_delete',
        'conditions',
        'is_active',
        'last_executed_at',
    ];

    protected $casts = [
        'conditions' => 'array',
        'auto_delete' => 'boolean',
        'is_active' => 'boolean',
        'last_executed_at' => 'datetime',
    ];

    /**
     * Scope to get active policies.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get policies by data type.
     */
    public function scopeForDataType($query, string $dataType)
    {
        return $query->where('data_type', $dataType);
    }

    /**
     * Scope to get policies that should auto-delete.
     */
    public function scopeAutoDelete($query)
    {
        return $query->where('auto_delete', true);
    }

    /**
     * Get the cutoff date for this retention policy.
     */
    public function getCutoffDate(): Carbon
    {
        return Carbon::now()->subDays($this->retention_days);
    }

    /**
     * Check if this policy should be executed.
     */
    public function shouldExecute(): bool
    {
        if (!$this->is_active) {
            return false;
        }

        // If never executed, should execute
        if (!$this->last_executed_at) {
            return true;
        }

        // Execute daily for auto-delete policies
        if ($this->auto_delete) {
            return $this->last_executed_at->diffInDays(Carbon::now()) >= 1;
        }

        // Execute weekly for manual policies
        return $this->last_executed_at->diffInDays(Carbon::now()) >= 7;
    }

    /**
     * Mark this policy as executed.
     */
    public function markAsExecuted(): void
    {
        $this->update(['last_executed_at' => Carbon::now()]);
    }
}
