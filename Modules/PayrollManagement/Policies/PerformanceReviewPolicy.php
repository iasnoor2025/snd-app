<?php

namespace Modules\PayrollManagement\Policies;

use Illuminate\Auth\Access\HandlesAuthorization;
use App\Models\User;
use Modules\EmployeeManagement\Domain\Models\PerformanceReview;

class PerformanceReviewPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any performance reviews.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('performance-reviews.view');
    }

    /**
     * Determine whether the user can view the performance review.
     */
    public function view(User $user, PerformanceReview $performanceReview): bool
    {
        return $user->hasPermissionTo('performance-reviews.view') ||
               $user->id === $performanceReview->employee_id ||
               $user->id === $performanceReview->reviewer_id;
    }

    /**
     * Determine whether the user can create performance reviews.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('performance-reviews.create');
    }

    /**
     * Determine whether the user can update the performance review.
     */
    public function update(User $user, PerformanceReview $performanceReview): bool
    {
        return $user->hasPermissionTo('performance-reviews.edit') ||
               $user->id === $performanceReview->reviewer_id;
    }

    /**
     * Determine whether the user can delete the performance review.
     */
    public function delete(User $user, PerformanceReview $performanceReview): bool
    {
        return $user->hasPermissionTo('performance-reviews.delete');
    }

    /**
     * Determine whether the user can approve the performance review.
     */
    public function approve(User $user, PerformanceReview $performanceReview): bool
    {
        return $user->hasPermissionTo('performance-reviews.edit') &&
               $performanceReview->status === 'pending';
    }

    /**
     * Determine whether the user can reject the performance review.
     */
    public function reject(User $user, PerformanceReview $performanceReview): bool
    {
        return $user->hasPermissionTo('performance-reviews.edit') &&
               $performanceReview->status === 'pending';
    }

    /**
     * Determine whether the user can submit employee comments.
     */
    public function submitComments(User $user, PerformanceReview $performanceReview): bool
    {
        return $user->id === $performanceReview->employee_id &&
               $performanceReview->status === 'pending';
    }
}
