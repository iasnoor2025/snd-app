<?php

namespace Modules\ProjectManagement\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Modules\EmployeeManagement\Domain\Models\Employee;

class ProjectResource extends Model
{
    use HasFactory;
    use SoftDeletes;
    protected $fillable = [
        'project_id',
        'type',
        'name',
        'description',
        'quantity',
        'unit_cost',
        'total_cost',
        'date',
        'status',
        'equipment_id',
        'equipment_type',
        'equipment_number',
        'operator_name',
        'operator_id',
        'usage_hours',
        'maintenance_cost',
        'employee_id',
        'worker_name',
        'position',
        'daily_rate',
        'days_worked',
        'material_name',
        'unit',
        'liters',
        'price_per_liter',
        'fuel_type',
        'category',
        'expense_description',
        'notes',
        'metadata',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'unit_cost' => 'decimal:2',
        'total_cost' => 'decimal:2',
        'usage_hours' => 'decimal:2',
        'maintenance_cost' => 'decimal:2',
        'daily_rate' => 'decimal:2',
        'liters' => 'decimal:2',
        'price_per_liter' => 'decimal:2',
        'metadata' => 'array',
        'date' => 'date',
    ];

    /**
     * Set the name attribute.
     *
     * @param string|null $value
     * @return void;
     */
    public function setNameAttribute($value)
    {
        if (empty($value)) {
            $type = $this->type ?? 'resource';
            $date = $this->date ? $this->date->format('Y-m-d') : date('Y-m-d');
            $this->attributes['name'] = ucfirst($type) . ' ' . $date;
        } else {
            $this->attributes['name'] = $value;
        }
    }

    // Relationships
    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function equipment()
    {
        return $this->belongsTo(Equipment::class);
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    // Scopes
    public function scopeEquipment($query)
    {
        return $query->where('type', 'equipment');
    }

    public function scopeManpower($query)
    {
        return $query->where('type', 'manpower');
    }

    public function scopeMaterials($query)
    {
        return $query->where('type', 'material');
    }

    public function scopeFuel($query)
    {
        return $query->where('type', 'fuel');
    }

    public function scopeExpenses($query)
    {
        return $query->where('type', 'expense');
    }

    // Accessors & Mutators
    public function getFormattedTotalCostAttribute()
    {
        return number_format($this->total_cost, 2);
    }

    public function getFormattedUnitCostAttribute()
    {
        return number_format($this->unit_cost, 2);
    }

    public function getFormattedQuantityAttribute()
    {
        return number_format($this->quantity, 2);
    }

    // Business Logic
    public function calculateTotalCost()
    {
        switch ($this->type) {
            case 'equipment':
                $this->total_cost = ($this->usage_hours * $this->unit_cost) + $this->maintenance_cost;
                break;
            case 'manpower':
                $this->total_cost = $this->daily_rate * $this->days_worked;
                break;
            case 'material':
                $this->total_cost = $this->quantity * $this->unit_cost;
                break;
            case 'fuel':
                $this->total_cost = $this->liters * $this->price_per_liter;
                break;
            case 'expense':
                $this->total_cost = $this->unit_cost;
                break;
        }
        return $this;
    }

    public function isApproved()
    {
        return $this->status === 'approved';
    }

    public function isPending()
    {
        return $this->status === 'pending';
    }

    public function isRejected()
    {
        return $this->status === 'rejected';
    }
}






