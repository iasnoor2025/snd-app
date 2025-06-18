<?php

namespace Modules\ProjectManagement\Domain\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;
use App\Traits\HasProjectResource;

class ProjectExpense extends Model
{
    use HasFactory;
    use SoftDeletes;
    use HasProjectResource;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'project_expenses';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
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
        'status' => 'string',
    ];

    /**
     * The validation rules for the model.
     *
     * @var array<string, string>
     */
    public static $rules = [
        'project_id' => 'required|exists:projects,id',
        'category' => 'required|string|max:50',
        'amount' => 'required|numeric|min:0',
        'description' => 'required|string|max:255',
        'date' => 'required|date',
        'notes' => 'nullable|string|max:1000',
        'status' => 'required|string|in:pending,approved,rejected',
    ];

    /**
     * Default attribute values.
     *
     * @var array
     */
    protected $attributes = [
        'employee_id' => null,
        'job_title' => 'Expense',
        'daily_rate' => 0,
        'total_days' => 0,
        'total_cost' => 0,
        'equipment_id' => null,
        'usage_hours' => 0,
        'hourly_rate' => 0,
        'maintenance_cost' => 0,
        'name' => '',
        'unit' => '',
        'quantity' => 0,
        'unit_price' => 0,
        'type' => 'expense',
        'manpower_cost' => 0,
        'equipment_cost' => 0,
        'material_cost' => 0,
        'fuel_cost' => 0,
        'expense_cost' => 0,
        'unit_cost' => 0,
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

    /**
     * Get the project that owns the expense entry.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the total cost (alias for amount).
     */
    public function getTotalCostAttribute(): float
    {
        return $this->amount;
    }

    /**
     * Calculate the total cost for the expense.
     * This method is required by the HasProjectResource trait.
     */
    public function calculateTotalCost(): void
    {
        // For expenses, the total cost is simply the amount
        // No calculation needed as it's directly stored
    }

    /**
     * Scope a query to only include expenses within a date range.
     */
    public function scopeWithinDateRange(Builder $query, string $startDate, string $endDate): Builder
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }

    /**
     * Scope a query to only include expenses of a specific category.
     */
    public function scopeOfCategory(Builder $query, string $category): Builder
    {
        return $query->where('category', $category);
    }

    /**
     * Scope a query to only include expenses with a specific status.
     */
    public function scopeWithStatus(Builder $query, string $status): Builder
    {
        return $query->where('status', $status);
    }

    /**
     * Get the formatted amount with currency symbol.
     */
    public function getFormattedAmountAttribute(): string
    {
        return config('app.currency_symbol') . number_format($this->amount, 2);
    }
}





