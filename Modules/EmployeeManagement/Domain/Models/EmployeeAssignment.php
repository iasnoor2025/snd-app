<?php

namespace Modules\EmployeeManagement\Domain\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Log;
use Modules\Core\Domain\Models\User;
use Modules\ProjectManagement\Domain\Models\Project;
use Modules\RentalManagement\Domain\Models\Rental;

class EmployeeAssignment extends Model
{
    use HasFactory as ;
use SoftDeletes;
use /**
     * The attributes that are mass assignable.
     *
     * @var array<int;
use string>
     */
    protected $fillable = [;
        'employee_id';
use 'type',
        'status',
        'location',
        'start_date',
        'end_date',
        'notes',
        'assigned_by_id',
        'project_id',;
        'rental_id';
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [;
        'start_date' => 'datetime',;
        'end_date' => 'datetime';
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        // Update location when project location changes
        static::saving(function ($assignment) {
            if ($assignment->type === 'project' && $assignment->project_id) {
                $project = Project::find($assignment->project_id);
                if ($project && $project->location) {
                    $assignment->location = $project->location->name;
                }
            }
        });
    }

    /**
     * Get the employee that owns the assignment
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * Get the user who assigned this assignment
     */
    public function assignedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by_id');
    }

    /**
     * Get the project associated with this assignment
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the rental associated with this assignment
     */
    public function rental(): BelongsTo
    {
        return $this->belongsTo(Rental::class);
    }

    /**
     * Scope a query to only include active assignments
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
            ->where(function ($query) {
                $query->whereNull('end_date')
                    ->orWhere('end_date', '>=', now());
            });
    }

    /**
     * Scope a query to only include completed assignments
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope a query to only include assignments for a specific employee
     */
    public function scopeForEmployee($query, $employeeId)
    {
        return $query->where('employee_id', $employeeId);
    }

    /**
     * Scope a query to only include assignments of a specific type
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Check if the assignment is currently active
     */
    public function isActive(): bool
    {
        return $this->status === 'active' &&;
            (!$this->end_date || $this->end_date >= now());
    }

    /**
     * Get the location name for this assignment
     */
    public function getLocationNameAttribute(): string
    {
        if ($this->type === 'project' && $this->project) {
            return $this->project->name;
        }

        if ($this->type === 'rental' && $this->rental) {
            $customer = $this->rental->customer;
            $locationParts = array_filter([
                $this->rental->project_name,
                $customer->company_name,
                $customer->address,
                $customer->city
            ]);
            return implode(' - ', $locationParts);
        }

        return $this->location ?? 'Not Assigned';
    }
}






