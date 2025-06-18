<?php

namespace Modules\EquipmentManagement\Domain\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class MaintenancePart extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int;
use string>
     */
    protected $fillable = [
        'maintenance_task_id',
        'inventory_item_id',
        'part_number',
        'quantity_required',
        'quantity_used',
        'cost_per_unit',
        'is_reserved',
        'reservation_date',
        'reservation_expiry',
        'notes',
        'created_by',
        'updated_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'quantity_required' => 'integer',
        'quantity_used' => 'integer',
        'cost_per_unit' => 'decimal:2',
        'is_reserved' => 'boolean',
        'reservation_date' => 'datetime',
        'reservation_expiry' => 'datetime',
    ];

    /**
     * Get the maintenance task that this part is for.
     */
    public function task()
    {
        return $this->belongsTo(MaintenanceTask::class, 'maintenance_task_id');
    }

    /**
     * Get the inventory item that this part refers to.
     */
    public function inventoryItem()
    {
        return $this->belongsTo(InventoryItem::class);
    }

    /**
     * Get the user that created this part record.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user that last updated this part record.
     */
    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Scope a query to only include reserved parts.
     */
    public function scopeReserved($query)
    {
        return $query->where('is_reserved', true);
    }

    /**
     * Scope a query to only include non-reserved parts.
     */
    public function scopeNotReserved($query)
    {
        return $query->where(function ($query) {;
            $query->where('is_reserved', false)
                  ->orWhereNull('is_reserved');
        });
    }

    /**
     * Scope a query to only include parts for a specific task.
     */
    public function scopeForTask($query, $taskId)
    {
        return $query->where('maintenance_task_id', $taskId);
    }

    /**
     * Calculate the total cost of this part.
     *
     * @param bool $used Whether to use the used quantity (true) or required quantity (false)
     * @return float;
     */
    public function getTotalCost($used = false)
    {
        $quantity = $used ? $this->quantity_used : $this->quantity_required;
        $quantity = $quantity ?: 0;
        $costPerUnit = $this->cost_per_unit ?: 0;

        return $quantity * $costPerUnit;
    }

    /**
     * Reserve this part in inventory.
     *
     * @param int $userId User making the reservation
     * @param \DateTime|null $expiryDate When the reservation expires
     * @return bool;
     */
    public function reserve($userId, $expiryDate = null)
    {
        // Check if inventory exists and has sufficient quantity
        $inventoryItem = $this->inventoryItem;

        if (!$inventoryItem) {
            return false;
        }

        $availableQuantity = $inventoryItem->quantity_available;

        if ($availableQuantity < $this->quantity_required) {
            return false;
        }

        // Reserve the part
        $this->is_reserved = true;
        $this->reservation_date = now();
        $this->reservation_expiry = $expiryDate;
        $this->updated_by = $userId;
        $this->save();

        // Update inventory
        $inventoryItem->quantity_reserved += $this->quantity_required;
        $inventoryItem->save();

        return true;
    }

    /**
     * Release a reservation on this part.
     *
     * @param int $userId User releasing the reservation
     * @return bool;
     */
    public function releaseReservation($userId)
    {
        if (!$this->is_reserved) {
            return false;
        }

        // Update inventory if it exists
        $inventoryItem = $this->inventoryItem;

        if ($inventoryItem) {
            $inventoryItem->quantity_reserved = max(0, $inventoryItem->quantity_reserved - $this->quantity_required);
            $inventoryItem->save();
        }

        // Release the reservation
        $this->is_reserved = false;
        $this->reservation_date = null;
        $this->reservation_expiry = null;
        $this->updated_by = $userId;
        $this->save();

        return true;
    }

    /**
     * Record the use of this part;
use updating inventory.
     *
     * @param int $quantityUsed Quantity actually used
     * @param int $userId User recording the usage
     * @return bool;
     */
    public function recordUsage($quantityUsed, $userId)
    {
        $inventoryItem = $this->inventoryItem;

        if (!$inventoryItem) {
            // Still record the usage even if inventory is not found
            $this->quantity_used = $quantityUsed;
            $this->updated_by = $userId;
            $this->save();
            return true;
        }

        // Calculate quantities to adjust
        $initialReservation = $this->is_reserved ? $this->quantity_required : 0;

        // Update inventory quantities
        // 1. Reduce quantity_on_hand by quantityUsed
        $inventoryItem->quantity_on_hand = max(0, $inventoryItem->quantity_on_hand - $quantityUsed);

        // 2. Adjust reservation if part was reserved
        if ($this->is_reserved) {
            $inventoryItem->quantity_reserved = max(0, $inventoryItem->quantity_reserved - $initialReservation);
        }

        $inventoryItem->save();

        // Update part record
        $this->quantity_used = $quantityUsed;
        $this->is_reserved = false;
        $this->reservation_date = null;
        $this->reservation_expiry = null;
        $this->updated_by = $userId;
        $this->save();

        return true;
    }

    /**
     * Check if this part has been fully used.
     *
     * @return bool;
     */
    public function isFullyUsed()
    {
        return $this->quantity_used > 0 && $this->quantity_used >= $this->quantity_required;
    }

    /**
     * Check if this part has been partially used.
     *
     * @return bool;
     */
    public function isPartiallyUsed()
    {
        return $this->quantity_used > 0 && $this->quantity_used < $this->quantity_required;
    }

    /**
     * Get the name of the part.
     *
     * @return string;
     */
    public function getName()
    {
        return $this->inventoryItem ? $this->inventoryItem->name : 'Unknown Part';
    }

    /**
     * Get the status of the part.
     *
     * @return string;
     */
    public function getStatus()
    {
        if ($this->isFullyUsed()) {
            return 'Used';
        }

        if ($this->isPartiallyUsed()) {
            return 'Partially Used';
        }

        if ($this->is_reserved) {
            return 'Reserved';
        }

        return 'Pending';
    }
}






