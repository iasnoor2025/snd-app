<?php

namespace Modules\EmployeeManagement\Domain\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\Core\Domain\Models\User;

class PerformanceReview extends Model
{
    use HasFactory;
    use SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'employee_id',
        'reviewer_id',
        'review_date',
        'job_knowledge_rating',
        'work_quality_rating',
        'attendance_rating',
        'communication_rating',
        'teamwork_rating',
        'initiative_rating',
        'overall_rating',
        'strengths',
        'weaknesses',
        'goals',
        'comments',
        'status',
        'type',
        'overall_score',
        'categories',
        'recommendations',
        'employee_comments',
        'reviewer_comments',
        'is_confidential',
        'is_acknowledged',
        'acknowledged_at',
        'metadata',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'review_date' => 'date',
        'strengths' => 'array',
        'weaknesses' => 'array',
        'goals' => 'array',
        'rating' => 'decimal:2',
        'overall_score' => 'decimal:2',
        'categories' => 'array',
        'is_confidential' => 'boolean',
        'is_acknowledged' => 'boolean',
        'acknowledged_at' => 'datetime',
        'metadata' => 'array',
    ];

    /**
     * Get the employee that owns the performance review.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * Get the reviewer (user) who conducted the review.
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'reviewer_id');
    }
}






