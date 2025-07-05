<?php

namespace Modules\TimesheetManagement\Domain\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Carbon\Carbon;
use Modules\EmployeeManagement\Domain\Models\Employee;
use Modules\ProjectManagement\Domain\Models\Project;
use Modules\RentalManagement\Domain\Models\Rental;
use Modules\Core\Domain\Models\User;
use Modules\TimesheetManagement\Domain\Models\GeofenceZone;
use Illuminate\Support\Facades\DB;

class Timesheet extends Model
{
    use HasFactory;
    use SoftDeletes;
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string> $fillable
     */
    protected $fillable = [
        'employee_id',
        'date',
        'hours_worked',
        'overtime_hours',
        'project_id',
        'rental_id',
        'description',
        'tasks',
        'status',
        'created_by',
        'start_time',
        'end_time',
        'location',
        // New approval workflow fields
        'foreman_approval_by',
        'foreman_approval_at',
        'foreman_approval_notes',
        'timesheet_incharge_approval_by',
        'timesheet_incharge_approval_at',
        'timesheet_incharge_approval_notes',
        'timesheet_checking_approval_by',
        'timesheet_checking_approval_at',
        'timesheet_checking_approval_notes',
        'manager_approval_by',
        'manager_approval_at',
        'manager_approval_notes',
        'rejected_by',
        'rejected_at',
        'rejection_reason',
        'rejection_stage',
        'gps_logs',
        // Mobile and geofencing fields
        'start_latitude',
        'start_longitude',
        'end_latitude',
        'end_longitude',
        'start_address',
        'end_address',
        'is_within_geofence',
        'geofence_violations',
        'distance_from_site',
        'device_id',
        'app_version',
        'is_offline_entry',
        'synced_at',
        'location_history',
        'accuracy_meters',
        'location_verified',
        'verification_method',
        'verification_data',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'date' => 'date',
        'hours_worked' => 'float',
        'overtime_hours' => 'float',
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
        'tasks' => 'json',
        'foreman_approval_at' => 'datetime',
        'timesheet_incharge_approval_at' => 'datetime',
        'timesheet_checking_approval_at' => 'datetime',
        'manager_approval_at' => 'datetime',
        'rejected_at' => 'datetime',
        'gps_logs' => 'json',
        // Mobile and geofencing casts
        'start_latitude' => 'decimal:8',
        'start_longitude' => 'decimal:8',
        'end_latitude' => 'decimal:8',
        'end_longitude' => 'decimal:8',
        'is_within_geofence' => 'boolean',
        'geofence_violations' => 'json',
        'distance_from_site' => 'decimal:2',
        'is_offline_entry' => 'boolean',
        'synced_at' => 'datetime',
        'location_history' => 'json',
        'location_verified' => 'boolean',
        'verification_data' => 'json',
    ];

    /**
     * The possible statuses for a timesheet in the 4-step approval workflow
     */
    const STATUS_DRAFT = 'draft'; // Initial status when created
    const STATUS_SUBMITTED = 'submitted'; // Submitted by employee
    const STATUS_FOREMAN_APPROVED = 'foreman_approved'; // Step 1: Approved by foreman
    const STATUS_INCHARGE_APPROVED = 'incharge_approved'; // Step 2: Approved by timesheet incharge
    const STATUS_CHECKING_APPROVED = 'checking_approved'; // Step 3: Approved by checking incharge
    const STATUS_MANAGER_APPROVED = 'manager_approved'; // Step 4: Approved by manager (final)
    const STATUS_REJECTED = 'rejected'; // Rejected at any stage

    /**
     * Rejection stages
     */
    const REJECTION_STAGE_FOREMAN = 'foreman';
    const REJECTION_STAGE_INCHARGE = 'incharge';
    const REJECTION_STAGE_CHECKING = 'checking';
    const REJECTION_STAGE_MANAGER = 'manager';

    /**
     * Get the employee that owns the timesheet
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * Get the project associated with the timesheet
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the rental associated with the timesheet
     */
    public function rental(): BelongsTo
    {
        return $this->belongsTo(Rental::class);
    }

    /**
     * Get the user who approved as foreman
     */
    public function foremanApprover(): BelongsTo
    {
        return $this->belongsTo(User::class, 'foreman_approval_by');
    }

    /**
     * Get the user who approved as timesheet incharge
     */
    public function inchargeApprover(): BelongsTo
    {
        return $this->belongsTo(User::class, 'timesheet_incharge_approval_by');
    }

    /**
     * Get the user who approved as checking incharge
     */
    public function checkingApprover(): BelongsTo
    {
        return $this->belongsTo(User::class, 'timesheet_checking_approval_by');
    }

    /**
     * Get the user who approved as manager
     */
    public function managerApprover(): BelongsTo
    {
        return $this->belongsTo(User::class, 'manager_approval_by');
    }

    /**
     * Get the user who rejected the timesheet
     */
    public function rejector(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rejected_by');
    }

    /**
     * Calculate the total hours (regular + overtime)
     */
    public function getTotalHoursAttribute(): float
    {
        return $this->hours_worked + $this->overtime_hours;
    }

    /**
     * Get the current approval step
     */
    public function getCurrentApprovalStep(): int
    {
        switch ($this->status) {
            case self::STATUS_DRAFT:
            case self::STATUS_SUBMITTED:
                return 0; // Not yet in approval flow;
            case self::STATUS_FOREMAN_APPROVED:
                return 1; // Passed step 1;
            case self::STATUS_INCHARGE_APPROVED:
                return 2; // Passed step 2;
            case self::STATUS_CHECKING_APPROVED:
                return 3; // Passed step 3;
            case self::STATUS_MANAGER_APPROVED:
                return 4; // Fully approved;
            case self::STATUS_REJECTED:
                return -1; // Rejected;
            default:
                return 0;
        }
    }

    /**
     * Check if the timesheet can be edited
     */
    public function canBeEdited(): bool
    {
        return in_array($this->status, [
            self::STATUS_DRAFT,
            self::STATUS_REJECTED
        ]);
    }

    /**
     * Check if the timesheet can be submitted
     */
    public function canBeSubmitted(): bool
    {
        return in_array($this->status, [
            self::STATUS_DRAFT,
            self::STATUS_REJECTED
        ]);
    }

    /**
     * Submit the timesheet for approval
     */
    public function submit(): bool
    {
        if (!$this->canBeSubmitted()) {
            return false;
        }

        $this->status = self::STATUS_SUBMITTED;
        return $this->save();
    }

    /**
     * Check if the timesheet can be approved by a foreman
     */
    public function canBeApprovedByForeman(): bool
    {
        return $this->status === self::STATUS_SUBMITTED;
    }

    /**
     * Approve the timesheet as a foreman
     */
    public function approveByForeman(int $foremanId, ?string $notes = null): bool
    {
        if (!$this->canBeApprovedByForeman()) {
            return false;
        }

        $this->status = self::STATUS_FOREMAN_APPROVED;
        $this->foreman_approval_by = $foremanId;
        $this->foreman_approval_at = now();
        $this->foreman_approval_notes = $notes;

        return $this->save();
    }

    /**
     * Check if the timesheet can be approved by a timesheet incharge
     */
    public function canBeApprovedByIncharge(): bool
    {
        return $this->status === self::STATUS_FOREMAN_APPROVED;
    }

    /**
     * Approve the timesheet as a timesheet incharge
     */
    public function approveByIncharge(int $inchargeId, ?string $notes = null): bool
    {
        if (!$this->canBeApprovedByIncharge()) {
            return false;
        }

        $this->status = self::STATUS_INCHARGE_APPROVED;
        $this->timesheet_incharge_approval_by = $inchargeId;
        $this->timesheet_incharge_approval_at = now();
        $this->timesheet_incharge_approval_notes = $notes;

        return $this->save();
    }

    /**
     * Check if the timesheet can be approved by a checking incharge
     */
    public function canBeApprovedByChecking(): bool
    {
        return $this->status === self::STATUS_INCHARGE_APPROVED;
    }

    /**
     * Approve the timesheet as a checking incharge
     */
    public function approveByChecking(int $checkingId, ?string $notes = null): bool
    {
        if (!$this->canBeApprovedByChecking()) {
            return false;
        }

        $this->status = self::STATUS_CHECKING_APPROVED;
        $this->timesheet_checking_approval_by = $checkingId;
        $this->timesheet_checking_approval_at = now();
        $this->timesheet_checking_approval_notes = $notes;

        return $this->save();
    }

    /**
     * Check if the timesheet can be approved by a manager
     */
    public function canBeApprovedByManager(): bool
    {
        return $this->status === self::STATUS_CHECKING_APPROVED;
    }

    /**
     * Approve the timesheet as a manager (final approval)
     */
    public function approveByManager(int $managerId, ?string $notes = null): bool
    {
        if (!$this->canBeApprovedByManager()) {
            return false;
        }

        $this->status = self::STATUS_MANAGER_APPROVED;
        $this->manager_approval_by = $managerId;
        $this->manager_approval_at = now();
        $this->manager_approval_notes = $notes;

        return $this->save();
    }

    /**
     * Reject the timesheet at any stage
     */
    public function reject(int $rejectedBy, string $reason, string $stage): bool
    {
        // Can only reject if not already rejected or fully approved
        if ($this->status === self::STATUS_REJECTED || $this->status === self::STATUS_MANAGER_APPROVED) {
            return false;
        }

        // Validate stage is one of the allowed rejection stages
        if (!in_array($stage, [
            self::REJECTION_STAGE_FOREMAN,
            self::REJECTION_STAGE_INCHARGE,
            self::REJECTION_STAGE_CHECKING,
            self::REJECTION_STAGE_MANAGER
        ])) {
            return false;
        }

        $this->status = self::STATUS_REJECTED;
        $this->rejected_by = $rejectedBy;
        $this->rejected_at = now();
        $this->rejection_reason = $reason;
        $this->rejection_stage = $stage;

        return $this->save();
    }

    /**
     * Check if an employee has overlapping timesheets for a specific date
     */
    public static function hasOverlap(int $employeeId, string $date, ?int $excludeId = null): bool
    {
        $query = self::where('employee_id', $employeeId)
            ->whereDate('date', $date);

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->exists();
    }

    /**
     * Check if an employee has exceeded the weekly limit of hours (60 hours/week)
     */
    public static function hasExceededWeeklyLimit(int $employeeId, string $date, float $hoursToAdd): bool
    {
        $date = Carbon::parse($date);
        $weekStart = $date->copy()->startOfWeek();
        $weekEnd = $date->copy()->endOfWeek();

        $weeklyHours = self::where('employee_id', $employeeId)
            ->whereBetween('date', [$weekStart, $weekEnd])
            ->sum(DB::raw('hours_worked + overtime_hours'));

        return ($weeklyHours + $hoursToAdd) > 60;
    }

    /**
     * Check if an employee has exceeded the monthly overtime limit (40 hours/month)
     */
    public static function hasExceededMonthlyOvertimeLimit(int $employeeId, string $date, float $overtimeToAdd): bool
    {
        $date = Carbon::parse($date);
        $monthStart = $date->copy()->startOfMonth();
        $monthEnd = $date->copy()->endOfMonth();

        $monthlyOvertime = self::where('employee_id', $employeeId)
            ->whereBetween('date', [$monthStart, $monthEnd])
            ->sum('overtime_hours');

        return ($monthlyOvertime + $overtimeToAdd) > 40;
    }

    /**
     * Get the approval progress as a percentage (0-100)
     */
    public function getApprovalProgressPercentage(): int
    {
        switch ($this->status) {
            case self::STATUS_DRAFT:
                return 0;
            case self::STATUS_SUBMITTED:
                return 10;
            case self::STATUS_FOREMAN_APPROVED:
                return 40;
            case self::STATUS_INCHARGE_APPROVED:
                return 60;
            case self::STATUS_CHECKING_APPROVED:
                return 80;
            case self::STATUS_MANAGER_APPROVED:
                return 100;
            case self::STATUS_REJECTED:
                return 0;
            default:
                return 0;
        }
    }

    /**
     * Get a human-readable description of the current approval stage
     */
    public function getApprovalStageDescription(): string
    {
        switch ($this->status) {
            case self::STATUS_DRAFT:
                return 'Draft';
            case self::STATUS_SUBMITTED:
                return 'Submitted, awaiting foreman approval';
            case self::STATUS_FOREMAN_APPROVED:
                return 'Approved by foreman, awaiting timesheet incharge approval';
            case self::STATUS_INCHARGE_APPROVED:
                return 'Approved by timesheet incharge, awaiting checking incharge approval';
            case self::STATUS_CHECKING_APPROVED:
                return 'Approved by checking incharge, awaiting manager approval';
            case self::STATUS_MANAGER_APPROVED:
                return 'Fully approved';
            case self::STATUS_REJECTED:
                $stage = match ($this->rejection_stage) {
                    self::REJECTION_STAGE_FOREMAN => 'foreman',
                    self::REJECTION_STAGE_INCHARGE => 'timesheet incharge',
                    self::REJECTION_STAGE_CHECKING => 'checking incharge',
                    self::REJECTION_STAGE_MANAGER => 'manager',
                    default => 'unknown'
                };
                return "Rejected by $stage";
            default:
                return 'Unknown status';
        }
    }
}






