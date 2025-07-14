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

        static::created(function ($assignment) {
            if (!$assignment->employee_id) return;
            $employeeId = $assignment->employee_id;
            $start = $assignment->start_date ? $assignment->start_date->toDateString() : now()->toDateString();
            $end = $assignment->end_date ? $assignment->end_date->toDateString() : $start;
            $today = now()->toDateString();
            $from = $start < $today ? $today : $start;
            $to = $end;
            $period = new \DatePeriod(new \DateTime($from), new \DateInterval('P1D'), (new \DateTime($to))->modify('+1 day'));
            foreach ($period as $date) {
                $dateStr = $date->format('Y-m-d');
                $data = [
                    'employee_id' => $employeeId,
                    'date' => $dateStr,
                    'status' => \Modules\TimesheetManagement\Domain\Models\Timesheet::STATUS_DRAFT,
                    'hours_worked' => 0,
                    'overtime_hours' => 0,
                    'start_time' => '08:00',
                    'end_time' => null,
                ];
                if ($assignment->type === 'project' && $assignment->project_id) {
                    $data['project_id'] = $assignment->project_id;
                }
                if ($assignment->type === 'rental' && $assignment->rental_id) {
                    $data['rental_id'] = $assignment->rental_id;
                }
                // For other types, you may want to add a 'description' or 'location' field
                if (!\Modules\TimesheetManagement\Domain\Models\Timesheet::hasOverlap($employeeId, $dateStr)) {
                    \Modules\TimesheetManagement\Domain\Models\Timesheet::create($data);
                }
            }
        });

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






