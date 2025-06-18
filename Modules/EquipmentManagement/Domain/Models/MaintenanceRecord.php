<?php

namespace Modules\EquipmentManagement\Domain\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MaintenanceRecord extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int;
     */
    protected $fillable = [
        'equipment_id',
        'type',
        'description',
        'cost',
        'status',
        'scheduled_date',
        'performed_date',
        'performed_by',
        'notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'scheduled_date' => 'datetime',
        'performed_date' => 'datetime',
        'cost' => 'decimal:2',
    ];

    /**
     * Get the equipment that owns the maintenance record
     */
    public function equipment(): BelongsTo
    {
        return $this->belongsTo(Equipment::class);
    }

    /**
     * Get the user who performed the maintenance
     */
    public function performedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'performed_by');
    }

    /**
     * Scope a query to only include scheduled maintenance
     */
    public function scopeScheduled($query)
    {
        return $query->where('status', 'scheduled');
    }

    /**
     * Scope a query to only include completed maintenance
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope a query to only include overdue maintenance
     */
    public function scopeOverdue($query)
    {
        return $query->where('status', 'scheduled')
            ->where('scheduled_date', '<', now());
    }

    /**
     * Scope a query to only include upcoming maintenance
     */
    public function scopeUpcoming($query, $days = 7)
    {
        return $query->where('status', 'scheduled')
            ->where('scheduled_date', '>=', now())
            ->where('scheduled_date', '<=', now()->addDays($days));
    }

    /**
     * Scope a query to only include maintenance of a specific type
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope a query to only include maintenance within a date range
     */
    public function scopeBetweenDates($query, $startDate, $endDate)
    {
        return $query->whereBetween('performed_date', [$startDate, $endDate]);
    }

    /**
     * Get the maintenance alerts for the maintenance record
     */
    public function maintenanceAlerts(): HasMany
    {
        return $this->hasMany(MaintenanceAlert::class);
    }

    /**
     * Get the maintenance parts for the maintenance record
     */
    public function maintenanceParts(): HasMany
    {
        return $this->hasMany(MaintenancePart::class);
    }

    /**
     * Get the parts for the maintenance record
     */
    public function parts()
    {
        return $this->belongsToMany(Part::class, 'maintenance_parts')
            ->withPivot('quantity', 'unit_cost', 'total_cost', 'used', 'notes')
            ->withTimestamps();
    }

    /**
     * Get the total cost of parts for this maintenance record
     */
    public function getPartsCostAttribute()
    {
        return $this->maintenanceParts()->sum('total_cost');
    }

    /**
     * Get the inventory transactions for the maintenance record
     */
    public function inventoryTransactions(): HasMany
    {
        return $this->hasMany(InventoryTransaction::class);
    }

    /**
     * Update equipment maintenance dates
     */
    public function updateEquipmentMaintenanceDates(): void
    {
        $equipment = $this->equipment;
        $equipment->last_maintenance_date = $this->scheduled_date;

        if ($this->performed_date) {
            $equipment->next_maintenance_date = $this->performed_date;
        }

        $equipment->save();
    }
}






