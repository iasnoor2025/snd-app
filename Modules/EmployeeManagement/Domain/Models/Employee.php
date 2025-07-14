<?php

namespace Modules\EmployeeManagement\Domain\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Modules\Core\Traits\HasMediaAttachments;
use Modules\Core\Traits\AutoLoadsRelations;
use Modules\Core\Traits\HasAvatar;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\TimesheetManagement\Domain\Models\Timesheet;
use Modules\ProjectManagement\Domain\Models\ProjectManpower;
use Modules\RentalManagement\Domain\Models\RentalOperatorAssignment;
use Modules\RentalManagement\Domain\Models\RentalItem;
use Modules\Core\Domain\Models\User;
use Modules\Core\Domain\Models\Location;
use Modules\EmployeeManagement\Domain\Models\Designation;
use Modules\EmployeeManagement\Domain\Models\Department;

// Add SalaryIncrement import
use Modules\EmployeeManagement\Domain\Models\SalaryIncrement;

class Employee extends Model implements HasMedia
{
    use HasFactory;
    use Notifiable;
    use HasMediaAttachments;
    use AutoLoadsRelations, SoftDeletes;
    use HasAvatar;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'erpnext_id',
        'user_id',
        'employee_id',
        'file_number',
        'first_name',
        'middle_name',
        'last_name',
        'email',
        'phone',
        'address',
        'city',
        'nationality',
        'designation_id',
        'department_id',
        'supervisor',
        'hourly_rate',
        'basic_salary',
        'food_allowance',
        'housing_allowance',
        'transport_allowance',
        'absent_deduction_rate',
        'overtime_rate_multiplier',
        'overtime_fixed_rate',
        'bank_name',
        'bank_account_number',
        'bank_iban',
        'contract_hours_per_day',
        'contract_days_per_month',
        'hire_date',
        'status',
        'current_location',
        'emergency_contact_name',
        'emergency_contact_phone',
        'emergency_contact_relationship',
        'notes',
        'advance_salary_eligible',
        'advance_salary_approved_this_month',
        // Additional identification fields
        'date_of_birth',
        'iqama_number',
        'iqama_expiry',
        'iqama_cost',
        'passport_number',
        'passport_expiry',
        // License and certification fields
        'driving_license_number',
        'driving_license_expiry',
        'driving_license_cost',
        'operator_license_number',
        'operator_license_expiry',
        'operator_license_cost',
        'tuv_certification_number',
        'tuv_certification_expiry',
        'tuv_certification_cost',
        'spsp_license_number',
        'spsp_license_expiry',
        'spsp_license_cost',
        // File paths for documents (legacy field names - kept for compatibility)
        'driving_license_file',
        'operator_license_file',
        'tuv_certification_file',
        'spsp_license_file',
        'passport_file',
        'iqama_file',
        // Custom certifications (stored as JSON)
        'custom_certifications',
        'is_operator',
        // Access restriction fields
        'access_restricted_until',
        'access_start_date',
        'access_end_date',
        'access_restriction_reason',
    ];

    /**
     * The attributes that should be appended to arrays.
     *
     * @var array<string>
     */
    protected $appends = [
        'current_assignment',
        'full_name',
        'has_approved_resignation',
        'bank_details',
        'name',
        'total_salary',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'hire_date' => 'date',
        'date_of_birth' => 'date',
        'iqama_expiry' => 'date',
        'iqama_cost' => 'decimal:2',
        'passport_expiry' => 'date',
        'driving_license_expiry' => 'date',
        'driving_license_cost' => 'decimal:2',
        'operator_license_expiry' => 'date',
        'operator_license_cost' => 'decimal:2',
        'tuv_certification_expiry' => 'date',
        'tuv_certification_cost' => 'decimal:2',
        'spsp_license_expiry' => 'date',
        'spsp_license_cost' => 'decimal:2',
        'hourly_rate' => 'decimal:2',
        'basic_salary' => 'decimal:2',
        'food_allowance' => 'decimal:2',
        'housing_allowance' => 'decimal:2',
        'transport_allowance' => 'decimal:2',
        'absent_deduction_rate' => 'decimal:2',
        'overtime_rate_multiplier' => 'decimal:2',
        'overtime_fixed_rate' => 'decimal:2',
        'contract_hours_per_day' => 'integer',
        'contract_days_per_month' => 'integer',
        'custom_certifications' => 'array',
        'advance_salary_eligible' => 'boolean',
        'advance_salary_approved_this_month' => 'boolean',
        'is_operator' => 'boolean',
        'access_restricted_until' => 'datetime',
        'access_start_date' => 'date',
        'access_end_date' => 'date',
    ];

    /**
     * Get the route key for the model.
     *
     * @return string;
     */
    public function getRouteKeyName()
    {
        return 'id';
    }

    /**
     * Resolve the route binding for the model.
     *
     * @param  mixed  $value
     * @param  string|null  $field
     * @return \Illuminate\Database\Eloquent\Model|null;
     */
    public function resolveRouteBinding($value, $field = null)
    {
        return $this->where($field ?? $this->getRouteKeyName(), (int) $value)->first();
    }

    public static function boot()
    {
        parent::boot();

        static::creating(function ($employee) {
            // Only generate file_number if it's not provided or empty
            if (!isset($employee->file_number) || empty($employee->file_number)) {
                $employee->file_number = self::generateNextFileNumber();
            }
            \Log::info('Employee creating event', [
                'file_number' => $employee->file_number,
                'name' => $employee->first_name . ' ' . $employee->last_name,
                'timestamp' => now()->toDateTimeString()
            ]);
        });

        static::created(function ($employee) {
            \Log::info('Employee created event', [
                'id' => $employee->id,
                'file_number' => $employee->file_number,
                'name' => $employee->first_name . ' ' . $employee->last_name,
                'timestamp' => now()->toDateTimeString()
            ]);
        });

        static::saving(function ($employee) {
            // Always recalculate hourly_rate before saving
            $days = $employee->contract_days_per_month ?: 30;
            $hours = $employee->contract_hours_per_day ?: 8;
            $salary = $employee->basic_salary ?: 0;
            $employee->hourly_rate = ($days > 0 && $hours > 0) ? round($salary / ($days * $hours), 2) : 0;
            \Log::info('Employee saving event', [
                'id' => $employee->id,
                'file_number' => $employee->file_number,
                'name' => $employee->first_name . ' ' . $employee->last_name,
                'timestamp' => now()->toDateTimeString(),
                'hourly_rate' => $employee->hourly_rate,
            ]);
            return true; // Allow the save to proceed
        });

        static::saved(function ($employee) {
            \Log::info('Employee saved event', [
                'id' => $employee->id,
                'file_number' => $employee->file_number,
                'name' => $employee->first_name . ' ' . $employee->last_name,
                'timestamp' => now()->toDateTimeString()
            ]);
        });
    }

    /**
     * Generate the next available employee file number using a database transaction
     * to prevent race conditions when multiple employees are created simultaneously
     *
     * @return string;
     */
    public static function generateNextFileNumber()
    {
        return \DB::transaction(function () {;
            $lastEmployee = self::lockForUpdate()
                ->orderBy('file_number', 'desc')
                ->first();

            $lastNumber = $lastEmployee && $lastEmployee->file_number
                ? (int) substr($lastEmployee->file_number, 4)
                : 0;

            return 'EMP-' . str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        });
    }

    /**
     * Get the user associated with the employee
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the leave requests for the employee
     */
    public function leaveRequests(): HasMany
    {
        return $this->hasMany(LeaveRequest::class);
    }

    /**
     * Get the rental items where this employee is assigned as an operator
     */
    public function rentalItems(): HasMany
    {
        return $this->hasMany(RentalItem::class, 'operator_id');
    }

    /**
     * Get the timesheets for the employee
     */
    public function timesheets(): HasMany
    {
        return $this->hasMany(Timesheet::class);
    }

    /**
     * Get the advance payments for the employee
     */
    public function advancePayments(): HasMany
    {
        return $this->hasMany(\Modules\PayrollManagement\Domain\Models\AdvancePayment::class);
    }

    /**
     * Get the advance payments for the employee (alias for advancePayments)
     */
    public function advances(): HasMany
    {
        return $this->advancePayments();
    }

    /**
     * Get the advance payment histories for the employee
     */
    public function advancePaymentHistories(): HasMany
    {
        return $this->hasMany(AdvancePaymentHistory::class);
    }

    /**
     * Get the total advance balance for the employee
     */
    public function getTotalAdvanceBalanceAttribute(): float
    {
        // Sum the remaining balance for all active advances
        return (float) $this->advancePayments()
            ->where('status', 'active')
            ->get()
            ->sum(function ($advance) {
                return $advance->amount - $advance->repaid_amount;
            });
    }

    /**
     * Get recent advance payments for the employee
     */
    public function getRecentAdvancePaymentsAttribute(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->advancePayments()
            ->with('payments')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();
    }

    /**
     * Get recent timesheets for the employee
     */
    public function recentTimesheets(): HasMany
    {
        return $this->timesheets()
            ->orderBy('date', 'desc')
            ->limit(10);
    }

    /**
     * Get the full name of the employee
     */
    public function getFullNameAttribute(): string
    {
        return trim(implode(' ', array_filter([
            $this->first_name,
            $this->middle_name,
            $this->last_name,
        ])));
    }

    /**
     * Get the total allowances for the employee
     */
    public function getTotalAllowancesAttribute(): float
    {
        return (float) ($this->food_allowance + $this->housing_allowance + $this->transport_allowance);
    }

    /**
     * Get the daily rate for the employee
     */
    public function getDailyRateAttribute(): float
    {
        if ($this->contract_days_per_month <= 0) {
            return 0;
        }

        return (float) ($this->basic_salary / $this->contract_days_per_month);
    }

    /**
     * Get the calculated hourly rate for the employee
     */
    public function getCalculatedHourlyRateAttribute(): float
    {
        if ($this->contract_hours_per_day <= 0 || $this->contract_days_per_month <= 0) {
            return 0;
        }

        return (float) ($this->basic_salary / ($this->contract_days_per_month * $this->contract_hours_per_day));
    }

    /**
     * Get the overtime rate for the employee
     */
    public function getOvertimeRateAttribute(): float
    {
        if ($this->overtime_fixed_rate > 0) {
            return (float) $this->overtime_fixed_rate;
        }

        return (float) ($this->hourly_rate * $this->overtime_rate_multiplier);
    }

    /**
     * Calculate absent deduction for the employee
     */
    public function calculateAbsentDeduction(int $absentDays): float
    {
        if ($absentDays <= 0) {
            return 0;
        }

        return (float) ($this->daily_rate * $absentDays);
    }

    /**
     * Calculate overtime pay for the employee
     */
    public function calculateOvertimePay(float $overtimeHours): float
    {
        if ($overtimeHours <= 0) {
            return 0;
        }

        return (float) ($this->overtime_rate * $overtimeHours);
    }

    /**
     * Calculate net salary for the employee
     */
    public function calculateNetSalary(
        int $daysWorked,
        float $overtimeHours,
        float $advancePayment = 0
    ): float {
        $absentDays = $this->contract_days_per_month - $daysWorked;

        $absentDeduction = $this->calculateAbsentDeduction($absentDays);
        $overtimePay = $this->calculateOvertimePay($overtimeHours);

        return (float) ($this->basic_salary + $this->total_allowances + $overtimePay - $absentDeduction - $advancePayment);
    }

    /**
     * Get the monthly timesheet data for the employee
     */
    public function getMonthlyTimesheetData(string $month, string $year): array
    {
        $startDate = Carbon::createFromDate($year, $month, 1)->startOfMonth();
        $endDate = Carbon::createFromDate($year, $month, 1)->endOfMonth();

        $timesheets = $this->timesheets()
            ->whereBetween('date', [$startDate, $endDate])
            ->orderBy('date')
            ->get();

        return [
            'calendar' => $this->generateCalendarData($timesheets, $startDate, $endDate),
            'total_days' => $endDate->day,
            'working_days' => $this->contract_days_per_month,
            'total_hours' => $timesheets->sum('hours'),
            'overtime_hours' => $timesheets->sum('overtime_hours'),
            'absent_days' => $this->contract_days_per_month - $timesheets->count(),
            'present_days' => $timesheets->count(),
        ];
    }

    /**
     * Generate calendar data for timesheets
     */
    protected function generateCalendarData($timesheets, $startDate, $endDate): array
    {
        $calendar = [];
        $currentDate = clone $startDate;

        while ($currentDate <= $endDate) {
            $dateStr = $currentDate->format('Y-m-d');
            $timesheet = $timesheets->firstWhere('date', $dateStr);

            $calendar[] = [
                'date' => $dateStr,
                'day' => $currentDate->day,
                'timesheet' => $timesheet,
                'is_weekend' => $currentDate->isWeekend(),
                'status' => $timesheet ? 'present' : 'absent',
            ];

            $currentDate->addDay();
        }

        return $calendar;
    }

    /**
     * Get the documents for the employee
     */
    public function documents()
    {
        return $this->getMedia('documents');
    }

    /**
     * Get the contracts for the employee
     */
    public function contracts()
    {
        return $this->getMedia('contracts');
    }

    /**
     * Register media collections for the employee
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('documents')
            ->acceptsMimeTypes([
                'application/pdf',
                'image/jpeg',
                'image/png',
                'image/gif',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ]);

        $this->addMediaCollection('contracts')
            ->acceptsMimeTypes(['application/pdf']);

        $this->addMediaCollection('profile_image')
            ->singleFile()
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/gif']);
    }

    /**
     * Register media conversions for the employee
     */
    public function registerMediaConversions(Media $media = null): void
    {
        // Register avatar conversions from HasAvatar trait
        $this->registerAvatarMediaConversions($media);

        // Employee-specific conversions
        $this->addMediaConversion('thumb')
            ->width(100)
            ->height(100)
            ->performOnCollections('profile_image');

        $this->addMediaConversion('preview')
            ->width(400)
            ->height(400)
            ->performOnCollections('profile_image');

        $this->addMediaConversion('document-preview')
            ->width(300)
            ->height(300)
            ->performOnCollections('documents');
    }

    /**
     * Get the current location of the employee
     */
    public function getCurrentLocationAttribute(): ?string
    {
        $assignment = $this->getCurrentAssignmentAttribute();

        if ($assignment && isset($assignment['location'])) {
            return $assignment['location'];
        }

        return null;
    }

    /**
     * Get the current assignment of the employee
     */
    public function getCurrentAssignmentAttribute()
    {
        // 1. Check for active manual assignment
        $manualAssignment = $this->assignments()
            ->with('assignedBy')
            ->where('type', 'manual')
            ->where('status', 'active')
            ->where(function($query) {
                $query->whereNull('end_date')
                    ->orWhere('end_date', '>=', now()->toDateString());
            })
            ->orderBy('start_date', 'desc')
            ->first();

        if ($manualAssignment) {
            return [
                'id' => (int) $manualAssignment->id,
                'type' => 'manual',
                'name' => $manualAssignment->name,
                'status' => $manualAssignment->status,
                'location' => $manualAssignment->location,
                'location_name' => $manualAssignment->location_name ?? null,
                'start_date' => $manualAssignment->start_date ? $manualAssignment->start_date->toDateString() : null,
                'end_date' => $manualAssignment->end_date ? $manualAssignment->end_date->toDateString() : null,
                'notes' => $manualAssignment->notes,
                'assigned_by' => $manualAssignment->assignedBy ? [
                    'id' => $manualAssignment->assignedBy->id,
                    'name' => $manualAssignment->assignedBy->name,
                ] : null,
                'project_id' => $manualAssignment->project_id,
                'rental_id' => $manualAssignment->rental_id,
                'deleted_at' => $manualAssignment->deleted_at,
                'title' => ucfirst($manualAssignment->type),
                'description' => $manualAssignment->notes,
                'project' => $manualAssignment->project ? [
                    'id' => $manualAssignment->project->id,
                    'name' => $manualAssignment->project->name,
                ] : null,
                'rental' => $manualAssignment->rental ? [
                    'id' => $manualAssignment->rental->id,
                    'project_name' => $manualAssignment->rental->project_name,
                    'rental_number' => $manualAssignment->rental->rental_number ?? null,
                ] : null,
                'rental_number' => $manualAssignment->rental ? $manualAssignment->rental->rental_number ?? null : null,
            ];
        }

        // Try to find active project assignment
        $projectAssignment = $this->projectManpower()
            ->where(function($query) {
                // An assignment is active if end_date is in the future or null
                $query->whereNull('end_date')
                    ->orWhere('end_date', '>=', now()->toDateString());
            })
            ->with(['project:id,name'])
            ->orderBy('start_date', 'desc')
            ->first();

        if ($projectAssignment) {
            return [
                'type' => 'project',
                'id' => $projectAssignment->project_id,
                'name' => $projectAssignment->project->name,
                'location' => 'Project Location', // Projects don't have location in current schema
                'date' => $projectAssignment->start_date,
                'role' => $projectAssignment->job_title,
            ];
        }

        // Try to find active rental assignment
        $rentalAssignment = $this->rentalAssignments()
            ->where('status', 'active')
            ->with(['rental:id,customer_id,location_id', 'rental.customer:id,name', 'rental.location:id,name'])
            ->orderBy('assignment_date', 'desc')
            ->first();

        if ($rentalAssignment) {
            return [
                'type' => 'rental',
                'id' => $rentalAssignment->rental_id,
                'name' => $rentalAssignment->rental->customer->name ?? 'Unknown Customer',
                'location' => $rentalAssignment->rental->location->name ?? 'Unknown Location',
                'date' => $rentalAssignment->assignment_date,
                'role' => 'Operator',
            ];
        }

        // Check if assigned as operator to any active rental items
        $rentalItem = $this->rentalItems()
            ->whereHas('rental', function ($query) {
                $query->where('status', 'active');
            })
            ->with(['equipment:id,name', 'rental:id,customer_id,location_id', 'rental.customer:id,name', 'rental.location:id,name'])
            ->orderBy('created_at', 'desc')
            ->first();

        if ($rentalItem) {
            return [
                'type' => 'rental_item',
                'id' => $rentalItem->rental_id,
                'name' => $rentalItem->rental->customer->name ?? 'Unknown Customer',
                'equipment' => $rentalItem->equipment->name ?? 'Unknown Equipment',
                'location' => $rentalItem->rental->location->name ?? 'Unknown Location',
                'date' => $rentalItem->created_at,
                'role' => 'Equipment Operator',
            ];
        }

        return null;
    }

    /**
     * Get the designation of the employee
     */
    public function designation(): BelongsTo
    {
        return $this->belongsTo(Designation::class);
    }

    /**
     * Get the location of the employee
     * Note: Using current_location as string field since current_location_id doesn't exist in migration
     */
    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'current_location', 'name');
    }

    /**
     * Get the project manpower for the employee
     */
    public function projectManpower(): HasMany
    {
        return $this->hasMany(ProjectManpower::class);
    }

    /**
     * Get the assignments for the employee
     */
    public function assignments(): HasMany
    {
        return $this->hasMany(EmployeeAssignment::class);
    }

    /**
     * Get the rental assignments for the employee
     */
    public function rentalAssignments(): HasMany
    {
        return $this->hasMany(RentalOperatorAssignment::class);
    }

    /**
     * Get the final settlements for the employee
     */
    public function finalSettlements(): HasMany
    {
        return $this->hasMany(FinalSettlement::class);
    }

    /**
     * Check if the employee has an approved resignation
     */
    public function getHasApprovedResignationAttribute(): bool
    {
        return $this->resignations()
            ->where('status', 'approved')
            ->exists();
    }

    /**
     * Get the resignations for the employee
     */
    public function resignations(): HasMany
    {
        return $this->hasMany(EmployeeResignation::class);
    }

    /**
     * Get the payrolls for the employee
     */
    public function payrolls(): HasMany
    {
        return $this->hasMany(Payroll::class);
    }

    /**
     * Get the performance reviews for the employee
     */
    public function performanceReviews(): HasMany
    {
        return $this->hasMany(EmployeePerformanceReview::class);
    }

    /**
     * Get the salary history for the employee
     */
    public function salaryHistory()
    {
        return $this->hasMany(EmployeeSalaryHistory::class);
    }

    /**
     * Get the salary records for the employee
     */
    public function salaries(): HasMany
    {
        return $this->hasMany(EmployeeSalary::class);
    }

    /**
     * Get the salary increments for the employee
     */
    public function salaryIncrements(): HasMany
    {
        return $this->hasMany(SalaryIncrement::class);
    }

    /**
     * Get the salary advances for the employee
     */
    public function salaryAdvances()
    {
        return $this->hasMany(SalaryAdvance::class);
    }

    /**
     * Get the current salary for the employee
     */
    public function getCurrentSalaryAttribute()
    {
        return $this->basic_salary + $this->total_allowances;
    }

    /**
     * Get the current base salary for the employee
     */
    public function getCurrentBaseSalaryAttribute()
    {
        return $this->basic_salary;
    }

    /**
     * Get the monthly salary for the employee
     */
    public function getMonthlySalaryAttribute()
    {
        return $this->basic_salary + $this->total_allowances;
    }

    /**
     * Get the pending advances for the employee
     */
    public function getPendingAdvancesAttribute()
    {
        // Replace 'remaining_amount' with (amount - repaid_amount)
        return $this->advancePayments()
            ->where('status', 'active')
            ->get()
            ->filter(function ($advance) {
                return ($advance->amount - $advance->repaid_amount) > 0;
            });
    }

    /**
     * Get the department of the employee
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Get the bank details of the employee
     */
    public function getBankDetailsAttribute(): array
    {
        return [
            'bank_name' => $this->bank_name,
            'account_number' => $this->bank_account_number,
            'iban' => $this->bank_iban,
        ];
    }

    /**
     * Get the name of the employee (alias for full_name)
     */
    public function getNameAttribute(): string
    {
        return $this->getFullNameAttribute();
    }

    /**
     * Get the total salary of the employee
     */
    public function getTotalSalaryAttribute(): float
    {
        return (float) ($this->basic_salary + $this->total_allowances);
    }

    public function skills()
    {
        return $this->belongsToMany(Skill::class, 'employee_skill')
            ->withPivot('proficiency', 'certified_at')
            ->withTimestamps();
    }

    /**
     * Create a new factory instance for the model.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    protected static function newFactory()
    {
        return \Modules\EmployeeManagement\database\factories\EmployeeFactory::new();
    }

    /**
     * Scope a query to only include active employees.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}






