<?php

namespace Modules\EquipmentManagement\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\MediaLibrary\HasMedia;
use Modules\EquipmentManagement\Traits\HasMediaAttachments;

class Part extends Model implements HasMedia
{
    use HasFactory;
    use SoftDeletes;
    use HasMediaAttachments;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'name',
        'description',
        'part_number',
        'category',
        'manufacturer',
        'supplier',
        'unit_cost',
        'reorder_level',
        'quantity_in_stock',
        'location',
        'is_active',
        'notes',
        'warranty_period',
        'last_ordered_at',
        'lead_time_days',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'unit_cost' => 'decimal:2',
        'reorder_level' => 'integer',
        'quantity_in_stock' => 'decimal:2',
        'is_active' => 'boolean',
        'last_ordered_at' => 'datetime',
        'lead_time_days' => 'integer',
    ];

    /**
     * Get the maintenance parts that use this part
     */
    public function maintenanceParts(): HasMany
    {
        return $this->hasMany(MaintenancePart::class);
    }

    /**
     * Scope a query to only include active parts
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Check if the part needs to be reordered
     */
    public function needsReorder(): bool
    {
        return $this->quantity_in_stock <= $this->reorder_level;
    }

    /**
     * Calculate the total value of this part in stock
     */
    public function getTotalStockValue(): float
    {
        return $this->quantity_in_stock * $this->unit_cost;
    }

    /**
     * Get the compatible equipment for this part
     */
    public function getCompatibleEquipment()
    {
        // Get all equipment that has used this part before
        $equipmentIds = $this->maintenanceParts()
            ->join('maintenance_records', 'maintenance_parts.maintenance_record_id', '=', 'maintenance_records.id')
            ->pluck('maintenance_records.equipment_id')
            ->unique();

        return Equipment::whereIn('id', $equipmentIds)->get();
    }

    /**
     * Get the usage statistics for this part
     */
    public function getUsageStatistics(int $months = 12): array
    {
        $startDate = now()->subMonths($months);

        $usageByMonth = $this->maintenanceParts()
            ->where('status', 'used')
            ->where('used_at', '>=', $startDate)
            ->selectRaw('YEAR(used_at) as year, MONTH(used_at) as month, SUM(quantity) as total')
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => "{$item->year}-{$item->month}",
                    'quantity' => $item->total,
                ];
            });

        return $usageByMonth->toArray();
    }

    /**
     * Get the availability status
     */
    public function getAvailabilityStatusAttribute(): string
    {
        if ($this->quantity_in_stock <= 0) {
            return 'out_of_stock';
        }

        if ($this->quantity_in_stock <= $this->reorder_level) {
            return 'low_stock';
        }

        return 'in_stock';
    }
}





