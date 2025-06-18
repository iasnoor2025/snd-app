<?php

namespace Modules\EquipmentManagement\Domain\Models;

use App\Notifications\MaintenanceTaskAssigned;
use App\Notifications\MaintenanceTaskCompleted;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MaintenanceTask extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int;
use string>
     */
    protected $fillable = [
        'title',
        'description',
        'maintenance_schedule_id',
        'equipment_id',
        'status',
        'scheduled_date',
        'completed_date',
        'estimated_duration',
        'actual_duration',
        'completion_notes',
        'assigned_to',
        'completed_by',
        'created_by',
        'updated_by',
        'cancellation_reason',
        'parts_cost',
        'labor_cost',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'scheduled_date' => 'datetime',
        'completed_date' => 'datetime',
        'parts_cost' => 'decimal:2',
        'labor_cost' => 'decimal:2',
    ];

    // Status constants
    const STATUS_PENDING = 'pending';
    const STATUS_ASSIGNED = 'assigned';
    const STATUS_IN_PROGRESS = 'in_progress';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';
    const STATUS_OVERDUE = 'overdue';

    /**
     * Get the maintenance schedule for this task.
     */
    public function schedule(): BelongsTo
    {
        return $this->belongsTo(MaintenanceSchedule::class, 'maintenance_schedule_id');
    }

    /**
     * Get the equipment for this task.
     */
    public function equipment(): BelongsTo
    {
        return $this->belongsTo(Equipment::class);
    }

    /**
     * Get the technician assigned to this task.
     */
    public function assignedTechnician(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Get the user who completed this task.
     */
    public function completedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'completed_by');
    }

    /**
     * Get the user who created this task.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated this task.
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Get the parts required for this maintenance task.
     */
    public function parts(): HasMany
    {
        return $this->hasMany(MaintenancePart::class);
    }

    /**
     * Scope a query to only include pending tasks.
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    /**
     * Scope a query to only include assigned tasks.
     */
    public function scopeAssigned($query)
    {
        return $query->where('status', self::STATUS_ASSIGNED);
    }

    /**
     * Scope a query to only include in-progress tasks.
     */
    public function scopeInProgress($query)
    {
        return $query->where('status', self::STATUS_IN_PROGRESS);
    }

    /**
     * Scope a query to only include completed tasks.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', self::STATUS_COMPLETED);
    }

    /**
     * Scope a query to only include cancelled tasks.
     */
    public function scopeCancelled($query)
    {
        return $query->where('status', self::STATUS_CANCELLED);
    }

    /**
     * Scope a query to only include overdue tasks.
     */
    public function scopeOverdue($query)
    {
        return $query->where('status', self::STATUS_OVERDUE);
    }

    /**
     * Scope a query to only include active tasks (not completed or cancelled).
     */
    public function scopeActive($query)
    {
        return $query->whereNotIn('status', [self::STATUS_COMPLETED, self::STATUS_CANCELLED]);
    }

    /**
     * Assign the task to a technician.
     *
     * @param int $technicianId
     * @param bool $sendNotification
     * @return $this;
     */
    public function assignTo($technicianId, $sendNotification = true)
    {
        $this->assigned_to = $technicianId;
        $this->status = self::STATUS_ASSIGNED;
        $this->save();

        if ($sendNotification) {
            $technician = User::find($technicianId);
            if ($technician) {
                $technician->notify(new MaintenanceTaskAssigned($this));
            }
        }

        return $this;
    }

    /**
     * Mark the task as in progress.
     *
     * @return $this;
     */
    public function markAsInProgress()
    {
        $this->status = self::STATUS_IN_PROGRESS;
        $this->save();

        return $this;
    }

    /**
     * Mark the task as completed.
     *
     * @param int $completedBy
     * @param int|null $actualDuration
     * @param string|null $notes
     * @param bool $sendNotification
     * @return $this;
     */
    public function markAsCompleted($completedBy, $actualDuration = null, $notes = null, $sendNotification = true)
    {
        $this->status = self::STATUS_COMPLETED;
        $this->completed_by = $completedBy;
        $this->completed_date = Carbon::now();

        if ($actualDuration !== null) {
            $this->actual_duration = $actualDuration;
        }

        if ($notes !== null) {
            $this->completion_notes = $notes;
        }

        $this->save();

        if ($sendNotification && $this->equipment->owner) {
            $this->equipment->owner->notify(new MaintenanceTaskCompleted($this));
        }

        return $this;
    }

    /**
     * Mark the task as cancelled.
     *
     * @param string|null $reason
     * @return $this;
     */
    public function markAsCancelled($reason = null)
    {
        $this->status = self::STATUS_CANCELLED;
        $this->cancellation_reason = $reason;
        $this->save();

        return $this;
    }

    /**
     * Mark the task as overdue.
     *
     * @return $this;
     */
    public function markAsOverdue()
    {
        // Only mark as overdue if it's not already completed or cancelled
        if (!in_array($this->status, [self::STATUS_COMPLETED, self::STATUS_CANCELLED])) {
            $this->status = self::STATUS_OVERDUE;
            $this->save();
        }

        return $this;
    }

    /**
     * Calculate the total cost of the task.
     *
     * @return float;
     */
    public function getTotalCost()
    {
        $partsCost = $this->parts_cost ?: 0;
        $laborCost = $this->labor_cost ?: 0;

        return $partsCost + $laborCost;
    }

    /**
     * Check if the task is overdue.
     *
     * @return bool;
     */
    public function isOverdue()
    {
        return $this->scheduled_date < Carbon::now() &&
               !in_array($this->status, [self::STATUS_COMPLETED, self::STATUS_CANCELLED]);
    }

    /**
     * Check if the task is completed.
     *
     * @return bool;
     */
    public function isCompleted()
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    /**
     * Check if the task is cancelled.
     *
     * @return bool;
     */
    public function isCancelled()
    {
        return $this->status === self::STATUS_CANCELLED;
    }

    /**
     * Check if the task is active (not completed or cancelled).
     *
     * @return bool;
     */
    public function isActive()
    {
        return !in_array($this->status, [self::STATUS_COMPLETED, self::STATUS_CANCELLED]);
    }

    /**
     * Get the formatted scheduled date.
     *
     * @return string;
     */
    public function getScheduledDateFormatted()
    {
        return $this->scheduled_date ? $this->scheduled_date->format('Y-m-d H:i') : '';
    }

    /**
     * Get the formatted completed date.
     *
     * @return string;
     */
    public function getCompletedDateFormatted()
    {
        return $this->completed_date ? $this->completed_date->format('Y-m-d H:i') : '';
    }
}






