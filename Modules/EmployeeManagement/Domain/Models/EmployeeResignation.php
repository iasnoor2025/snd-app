<?php

namespace Modules\EmployeeManagement\Domain\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class EmployeeResignation extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'employee_id',
        'resignation_date',
        'last_working_date',
        'reason',
        'status',
        'comments',
        'notice_period',
        'submitted_by_id',
        'approved_by_id',
        'approval_date',
        'exit_interview_date',
        'exit_interview_conducted_by_id',
        'clearance_status',
        'handover_notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'resignation_date' => 'date',
        'last_working_date' => 'date',
        'approval_date' => 'date',
        'exit_interview_date' => 'date',
        'notice_period' => 'integer',
    ];

    /**
     * Get the employee associated with this resignation
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * Get the user who submitted the resignation
     */
    public function submittedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by_id');
    }

    /**
     * Get the user who approved the resignation
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by_id');
    }

    /**
     * Get the user who conducted the exit interview
     */
    public function exitInterviewConductedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'exit_interview_conducted_by_id');
    }

    /**
     * Scope a query to only include pending resignations
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope a query to only include approved resignations
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope a query to only include rejected resignations
     */
    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    /**
     * Check if the resignation is pending
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if the resignation is approved
     */
    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    /**
     * Check if the resignation is rejected
     */
    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }
}






