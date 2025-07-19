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

        // On save, manage assignment statuses properly
        static::saved(function ($assignment) {
            if (!$assignment->start_date || !$assignment->employee_id) return;

            Log::info('EmployeeAssignment saved event', [
                'current_id' => $assignment->id,
                'employee_id' => $assignment->employee_id,
                'current_start' => $assignment->start_date,
                'current_status' => $assignment->status
            ]);

            // Get all assignments for this employee, ordered by start date and ID
            $allAssignments = self::where('employee_id', $assignment->employee_id)
                ->orderBy('start_date', 'asc')
                ->orderBy('id', 'asc')
                ->get();

            // Find the current/latest assignment (the one with the latest start date)
            $currentAssignment = $allAssignments->sortByDesc('start_date')->first();

            Log::info('Assignment status management', [
                'total_assignments' => $allAssignments->count(),
                'current_assignment_id' => $currentAssignment ? $currentAssignment->id : null,
                'saved_assignment_id' => $assignment->id
            ]);

            // Update all assignments based on their position
            foreach ($allAssignments as $assignmentItem) {
                $isCurrent = $assignmentItem->id === $currentAssignment->id;

                if ($isCurrent) {
                    // Current assignment should be active and have no end date
                    if ($assignmentItem->status !== 'active' || $assignmentItem->end_date !== null) {
                        Log::info('Updating current assignment status', [
                            'assignment_id' => $assignmentItem->id,
                            'old_status' => $assignmentItem->status,
                            'new_status' => 'active'
                        ]);

                        \DB::table('employee_assignments')
                            ->where('id', $assignmentItem->id)
                            ->update([
                                'status' => 'active',
                                'end_date' => null
                            ]);
                    }
                } else {
                    // Previous assignments should be completed and have an end date
                    if ($assignmentItem->status !== 'completed' || $assignmentItem->end_date === null) {
                        // Set end date to the day before the current assignment starts
                        $endDate = $currentAssignment->start_date->copy()->subDay()->format('Y-m-d');

                        Log::info('Updating previous assignment status', [
                            'assignment_id' => $assignmentItem->id,
                            'old_status' => $assignmentItem->status,
                            'new_status' => 'completed',
                            'end_date' => $endDate
                        ]);

                        \DB::table('employee_assignments')
                            ->where('id', $assignmentItem->id)
                            ->update([
                                'status' => 'completed',
                                'end_date' => $endDate
                            ]);
                    }
                }
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






