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
        'next_review_date',
        'rating',
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
        'next_review_date' => 'date',
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
        return $this->belongsTo(User::class, 'reviewer_id');
    }
}






