<?php

namespace Modules\ProjectManagement\Domain\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProjectEquipment extends Model
{
    use HasFactory;
use SoftDeletes;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'project_equipment';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'project_id',
        'employee_id',
        'job_title',
        'start_date',
        'end_date',
        'daily_rate',
        'total_days',
        'total_cost',
        'notes',
        'equipment_id',
        'usage_hours',
        'hourly_rate',
        'maintenance_cost',
        'name',
        'unit',
        'quantity',
        'unit_price',
        'date_used',
        'type',
        'date',
        'category',
        'amount',
        'description',
        'manpower_cost',
        'equipment_cost',
        'material_cost',
        'fuel_cost',
        'expense_cost',
        'unit_cost',
        'status',
        'equipment_type',
        'equipment_number',
        'operator_name',
        'operator_id',
        'worker_name',
        'position',
        'days_worked',
        'material_id',
        'liters',
        'price_per_liter',
        'metadata',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'date_used' => 'date',
        'date' => 'date',
        'daily_rate' => 'decimal:2',
        'total_days' => 'decimal:2',
        'total_cost' => 'decimal:2',
        'usage_hours' => 'decimal:2',
        'hourly_rate' => 'decimal:2',
        'maintenance_cost' => 'decimal:2',
        'quantity' => 'decimal:2',
        'unit_price' => 'decimal:2',
        'amount' => 'decimal:2',
        'manpower_cost' => 'decimal:2',
        'equipment_cost' => 'decimal:2',
        'material_cost' => 'decimal:2',
        'fuel_cost' => 'decimal:2',
        'expense_cost' => 'decimal:2',
        'unit_cost' => 'decimal:2',
        'liters' => 'decimal:2',
        'price_per_liter' => 'decimal:2',
        'metadata' => 'array',
    ];

    /**
     * Default attribute values.
     *
     * @var array
     */
    protected $attributes = [
        'employee_id' => null,
        'job_title' => 'Equipment Operation',
        'daily_rate' => 0,
        'total_days' => 0,
        'maintenance_cost' => 0,
        'name' => '',
        'unit' => 'hours',
        'quantity' => 0,
        'unit_price' => 0,
        'type' => 'equipment',
        'category' => 'equipment',
        'amount' => 0,
        'description' => '',
        'manpower_cost' => 0,
        'equipment_cost' => 0,
        'material_cost' => 0,
        'fuel_cost' => 0,
        'expense_cost' => 0,
        'unit_cost' => 0,
        'status' => 'active',
        'equipment_type' => null,
        'equipment_number' => null,
        'operator_name' => null,
        'operator_id' => null,
        'worker_name' => '',
        'position' => null,
        'days_worked' => null,
        'material_id' => null,
        'liters' => 0,
        'price_per_liter' => 0,
        'metadata' => null,
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            $model->calculateTotalCost();
        });

        static::updating(function ($model) {
            $model->calculateTotalCost();
        });
    }

    /**
     * Get the project that owns the equipment.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the equipment details.
     */
    public function equipment(): BelongsTo
    {
        return $this->belongsTo(Equipment::class);
    }

    /**
     * Calculate the total cost for this equipment.
     *
     * @return void;
     */
    public function calculateTotalCost(): void
    {
        $this->total_cost = ($this->usage_hours * $this->hourly_rate) + $this->maintenance_cost;
    }
}




