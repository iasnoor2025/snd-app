<?php

namespace Modules\PayrollManagement\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Modules\EmployeeManagement\Domain\Models\Employee;
use Modules\EmployeeManagement\Domain\Models\PerformanceReview;
use Illuminate\Support\Carbon;

class PerformanceReviewService
{
    /**
     * Get all performance reviews with optional filtering
     */
    public function getReviewsByStatus(string $status)
    {
        return PerformanceReview::where('status', $status)
            ->with(['employee', 'reviewer'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get employee reviews by period
     */
    public function getEmployeeReviewsByPeriod(int $employeeId, string $startDate, string $endDate)
    {
        return PerformanceReview::where('employee_id', $employeeId)
            ->whereBetween('review_date', [$startDate, $endDate])
            ->with(['employee', 'reviewer'])
            ->orderBy('review_date', 'desc')
            ->get();
    }

    /**
     * Get all reviews for a specific employee
     */
    public function getEmployeeReviews(int $employeeId)
    {
        return PerformanceReview::where('employee_id', $employeeId)
            ->with(['employee', 'reviewer'])
            ->orderBy('review_date', 'desc')
            ->get();
    }

    /**
     * Get reviews by reviewer
     */
    public function getReviewsByReviewer(int $reviewerId)
    {
        return PerformanceReview::where('reviewer_id', $reviewerId)
            ->with(['employee', 'reviewer'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get pending reviews
     */
    public function getPendingReviews()
    {
        return PerformanceReview::where('status', 'pending')
            ->with(['employee', 'reviewer'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get a specific review by ID
     */
    public function getReview(int $id)
    {
        return PerformanceReview::with(['employee', 'reviewer'])->find($id);
    }

    /**
     * Create a new performance review
     */
    public function createReview(array $data)
    {
        $data['created_by'] = Auth::id();
        $data['status'] = $data['status'] ?? 'pending';

        return PerformanceReview::create($data);
    }

    /**
     * Update a performance review
     */
    public function updateReview(int $id, array $data)
    {
        $review = PerformanceReview::findOrFail($id);
        $data['updated_by'] = Auth::id();

        $review->update($data);
        return $review->fresh(['employee', 'reviewer']);
    }

    /**
     * Delete a performance review
     */
    public function deleteReview(int $id)
    {
        $review = PerformanceReview::findOrFail($id);
        return $review->delete();
    }

    /**
     * Approve a performance review
     */
    public function approveReview(int $id, array $data = [])
    {
        $review = PerformanceReview::findOrFail($id);

        $review->update([
            'status' => 'approved',
            'approved_by' => Auth::id(),
            'approved_at' => Carbon::now(),
            'approval_comments' => $data['approval_comments'] ?? null,
        ]);

        return $review->fresh(['employee', 'reviewer', 'approver']);
    }

    /**
     * Reject a performance review
     */
    public function rejectReview(int $id, array $data)
    {
        $review = PerformanceReview::findOrFail($id);

        $review->update([
            'status' => 'rejected',
            'rejected_by' => Auth::id(),
            'rejected_at' => Carbon::now(),
            'rejection_reason' => $data['rejection_reason'] ?? null,
        ]);

        return $review->fresh(['employee', 'reviewer', 'rejecter']);
    }

    /**
     * Submit employee comments for a review
     */
    public function submitEmployeeComments(int $id, array $data)
    {
        $review = PerformanceReview::findOrFail($id);

        $review->update([
            'employee_comments' => $data['employee_comments'],
            'employee_comments_submitted_at' => Carbon::now(),
        ]);

        return $review->fresh(['employee', 'reviewer']);
    }

    /**
     * Get performance statistics
     */
    public function getPerformanceStatistics()
    {
        $stats = [
            'total_reviews' => PerformanceReview::count(),
            'pending_reviews' => PerformanceReview::where('status', 'pending')->count(),
            'approved_reviews' => PerformanceReview::where('status', 'approved')->count(),
            'rejected_reviews' => PerformanceReview::where('status', 'rejected')->count(),
            'average_rating' => PerformanceReview::where('status', 'approved')
                ->selectRaw('AVG((job_knowledge_rating + work_quality_rating + attendance_rating + communication_rating + teamwork_rating + initiative_rating) / 6) as avg_rating')
                ->first()->avg_rating ?? 0,
        ];

        return $stats;
    }

    /**
     * Get reviews for dashboard
     */
    public function getDashboardReviews(int $limit = 5)
    {
        return PerformanceReview::with(['employee', 'reviewer'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }
}
