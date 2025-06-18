<?php

namespace Modules\ProjectManagement\Domain\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProjectMaterial extends Model
{
    use HasFactory;
use SoftDeletes;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'project_materials';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'project_id',
        'name',
        'unit',
        'quantity',
        'unit_price',
        'total_cost',
        'date_used',
        'notes',
        'job_title',
        'start_date',
        'daily_rate',
        'total_days',
        'usage_hours',
        'hourly_rate',
        'type',
        'date',
        'category',
        'amount',
        'unit_cost',
        'status',
        'worker_name',
        'liters',
        'price_per_liter',
    ];

    /**
     * The attributes that should have default values.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'job_title' => 'Material Supply',
        'daily_rate' => 0,
        'total_days' => 1,
        'usage_hours' => 0,
        'hourly_rate' => 0,
        'type' => 'material',
        'category' => 'material',
        'amount' => 0,
        'unit_cost' => 0,
        'status' => 'active',
        'worker_name' => 'Material Handler',
        'liters' => 0,
        'price_per_liter' => 0,
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'date_used' => 'date',
        'start_date' => 'date',
        'date' => 'date',
        'quantity' => 'decimal:2',
        'unit_price' => 'decimal:2',
        'total_cost' => 'decimal:2',
        'daily_rate' => 'decimal:2',
        'total_days' => 'decimal:2',
        'usage_hours' => 'decimal:2',
        'hourly_rate' => 'decimal:2',
        'amount' => 'decimal:2',
        'unit_cost' => 'decimal:2',
        'liters' => 'decimal:2',
        'price_per_liter' => 'decimal:2',
    ];

    /**
     * Get the project that owns the material entry.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Calculate the total cost based on quantity and unit price.
     */
    public function calculateTotalCost(): void
    {
        $this->total_cost = $this->quantity * $this->unit_price;
    }
}




