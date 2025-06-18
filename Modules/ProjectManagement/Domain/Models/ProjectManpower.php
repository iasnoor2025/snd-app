<?php

namespace Modules\ProjectManagement\Domain\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\EmployeeManagement\Domain\Models\Employee;

class ProjectManpower extends Model
{
    use HasFactory;
use SoftDeletes;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'project_manpower';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'project_id',
        'employee_id',
        'worker_name',
        'job_title',
        'start_date',
        'end_date',
        'daily_rate',
        'total_days',
        'total_cost',
        'notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'daily_rate' => 'decimal:2',
        'total_days' => 'decimal:2',
        'total_cost' => 'decimal:2',
    ];

    /**
     * Get the project that owns the manpower entry.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the employee associated with the manpower entry.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * Calculate the total cost based on daily rate and total days.
     */
    public function calculateTotalCost(): void
    {
        $this->total_cost = $this->daily_rate * $this->total_days;
    }
}




