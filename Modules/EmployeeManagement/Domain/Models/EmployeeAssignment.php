<?php

namespace Modules\EmployeeManagement\Domain\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Log;
use Modules\Core\Domain\Models\User;
use Modules\ProjectManagement\Domain\Models\Project;
use Modules\RentalManagement\Domain\Models\Rental;

class EmployeeAssignment extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'employee_id',
        'type',
        'name',
        'status',
        'location',
        'start_date',
        'end_date',
        'notes',
        'assigned_by',
        'project_id',
        'rental_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
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

        // On save, update only the immediate previous assignment's end_date and status if it does not already have an end_date
        static::saved(function ($assignment) {
            if (!$assignment->start_date || !$assignment->employee_id) return;
            $currentStart = (new \DateTime($assignment->start_date))->format('Y-m-d');
            Log::info('EmployeeAssignment saved event', [
                'current_id' => $assignment->id,
                'employee_id' => $assignment->employee_id,
                'current_start' => $currentStart
            ]);
            // Only run if this is the latest assignment for the employee
            $latest = self::where('employee_id', $assignment->employee_id)
                ->orderByDesc('start_date')
                ->orderByDesc('id')
                ->first();
            if (!$latest || $latest->id !== $assignment->id) {
                Log::info('Not the latest assignment, skipping previous update', ['current_id' => $assignment->id, 'latest_id' => $latest ? $latest->id : null]);
                return;
            }
            // Find the immediate previous assignment for the same employee (latest start_date before current), or if same start_date, lower id
            $previous = self::where('employee_id', $assignment->employee_id)
                ->where('id', '!=', $assignment->id)
                ->where(function($query) use ($currentStart, $assignment) {
                    $query->whereRaw('DATE(start_date) < ?', [$currentStart])
                        ->orWhere(function($q) use ($currentStart, $assignment) {
                            $q->whereRaw('DATE(start_date) = ?', [$currentStart])
                              ->where('id', '<', $assignment->id);
                        });
                })
                ->whereNull('end_date')
                ->orderByDesc('start_date')
                ->orderByDesc('id')
                ->first();
            Log::info('Previous assignment query result', [
                'previous_id' => $previous ? $previous->id : null,
                'previous_start' => $previous ? $previous->start_date : null,
                'previous_end_date_before' => $previous ? $previous->end_date : null,
                'previous_status_before' => $previous ? $previous->status : null
            ]);
            if ($previous) {
                $previous->refresh();
                $previous->end_date = (new \DateTime($assignment->start_date))->modify('-1 day')->format('Y-m-d');
                $previous->status = 'completed';
                $previous->save();
                $previous->refresh();
                Log::info('Updated previous assignment', [
                    'prev_id' => $previous->id,
                    'new_end_date' => $previous->end_date,
                    'new_status' => $previous->status
                ]);
            } else {
                $all = self::where('employee_id', $assignment->employee_id)->orderBy('start_date')->get(['id','start_date','end_date','status'])->toArray();
                Log::info('No previous assignment found to update', ['employee_id' => $assignment->employee_id, 'current_start' => $currentStart, 'all_assignments' => $all]);
            }
        });

        // Only keep timesheet cleanup on delete
        static::deleted(function ($assignment) {
            if (!$assignment->employee_id) return;
            $employeeId = $assignment->employee_id;
            $today = now()->toDateString();
            $query = \Modules\TimesheetManagement\Domain\Models\Timesheet::where('employee_id', $employeeId)
                ->where('date', '>=', $today);
            if ($assignment->type === 'project' && $assignment->project_id) {
                $query->where('project_id', $assignment->project_id);
            }
            if ($assignment->type === 'rental' && $assignment->rental_id) {
                $query->where('rental_id', $assignment->rental_id);
            }
            // For other types, you may want to filter by description/location if needed
            $query->delete();
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
        return $this->belongsTo(User::class, 'assigned_by');
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
     * Get the timesheets for this assignment
     */
    public function timesheets(): HasMany
    {
        return $this->hasMany(\Modules\TimesheetManagement\Domain\Models\Timesheet::class, 'assignment_id');
    }

    /**
     * Scope a query to only include active assignments
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active')
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
        return $this->status === 'active' && (!$this->end_date || $this->end_date >= now());
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






