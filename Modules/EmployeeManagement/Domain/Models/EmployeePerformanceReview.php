<?php

namespace Modules\EmployeeManagement\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\Core\Domain\Models\BaseModel;
use Modules\Core\Domain\Models\User;

class EmployeePerformanceReview extends BaseModel
{
    use SoftDeletes;
    protected $fillable = [
        'employee_id',
        'reviewer_id',
        'review_date',
        'review_period_start',
        'review_period_end',
        'overall_rating',
        'job_knowledge_rating',
        'work_quality_rating',
        'attendance_rating',
        'communication_rating',
        'teamwork_rating',
        'initiative_rating',
        'strengths',
        'weaknesses',
        'goals',
        'comments',
        'employee_comments',
        'status',
        'approved_by',
        'approved_at',
    ];

    protected $casts = [
        'review_date' => 'date',
        'review_period_start' => 'date',
        'review_period_end' => 'date',
        'overall_rating' => 'decimal:1',
        'job_knowledge_rating' => 'decimal:1',
        'work_quality_rating' => 'decimal:1',
        'attendance_rating' => 'decimal:1',
        'communication_rating' => 'decimal:1',
        'teamwork_rating' => 'decimal:1',
        'initiative_rating' => 'decimal:1',
        'strengths' => 'array',
        'weaknesses' => 'array',
        'goals' => 'array',
        'approved_at' => 'datetime',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function getAverageRatingAttribute(): float
    {
        $ratings = [
            $this->job_knowledge_rating,
            $this->work_quality_rating,
            $this->attendance_rating,
            $this->communication_rating,
            $this->teamwork_rating,
            $this->initiative_rating,
        ];

        return array_sum($ratings) / count($ratings);
    }

    public function getRatingCategoryAttribute(): string
    {
        $rating = $this->overall_rating;

        if ($rating >= 4.5) {
            return 'Outstanding';
        } elseif ($rating >= 3.5) {
            return 'Excellent';
        } elseif ($rating >= 2.5) {
            return 'Good';
        } elseif ($rating >= 1.5) {
            return 'Needs Improvement';
        } else {
            return 'Unsatisfactory';
        }
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    public function approve(User $approver): void
    {
        $this->update([
            'status' => 'approved',
            'approved_by' => $approver->id,
            'approved_at' => now(),
        ]);
    }

    public function reject(): void
    {
        $this->update([
            'status' => 'rejected'
        ]);
    }
}






