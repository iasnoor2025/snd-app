<?php

namespace Modules\EmployeeManagement\Services;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Modules\EmployeeManagement\Repositories\PerformanceReviewRepository;
use Modules\EmployeeManagement\Domain\Models\PerformanceReview;
use Modules\EmployeeManagement\Domain\Models\Employee;

class PerformanceReviewService
{
    protected $performanceReviewRepository;

    public function __construct(PerformanceReviewRepository $performanceReviewRepository)
    {
        $this->performanceReviewRepository = $performanceReviewRepository;
    }

    public function getEmployeeReviews(int $employeeId)
    {
        return $this->performanceReviewRepository->getEmployeeReviews($employeeId);
    }

    public function getReview(int $id)
    {
        return $this->performanceReviewRepository->find($id);
    }

    public function getPendingReviews()
    {
        return $this->performanceReviewRepository->getPendingReviews();
    }

    public function getReviewsByReviewer(int $reviewerId)
    {
        return $this->performanceReviewRepository->getReviewsByReviewer($reviewerId);
    }

    public function getReviewsByStatus(string $status)
    {
        return $this->performanceReviewRepository->getReviewsByStatus($status);
    }

    public function getEmployeeReviewsByPeriod(int $employeeId, string $startDate, string $endDate)
    {
        return $this->performanceReviewRepository->getEmployeeReviewsByPeriod($employeeId, $startDate, $endDate);
    }

    public function getReviewsForEmployee(Employee $employee)
    {
        return PerformanceReview::where('employee_id', $employee->id)->orderByDesc('review_date')->get();
    }

    public function createReview(array $data): PerformanceReview
    {
        return PerformanceReview::create($data);
    }

    public function updateReview(PerformanceReview $review, array $data): PerformanceReview
    {
        $review->update($data);
        return $review->fresh();
    }

    public function deleteReview(PerformanceReview $review): void
    {
        $review->delete();
    }

    public function approveReview(int $id, int $approverId)
    {
        try {
            DB::beginTransaction();

            $review = $this->performanceReviewRepository->find($id);

            if (!$review) {
                throw new \Exception('Performance review not found');
            }

            if ($review->isApproved()) {
                throw new \Exception('Performance review is already approved');
            }

            $this->performanceReviewRepository->update($id, [
                'status' => 'approved',
                'approved_by' => $approverId,
                'approved_at' => now(),
            ]);

            DB::commit();
            return $review;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to approve performance review: ' . $e->getMessage());
            throw $e;
        }
    }

    public function rejectReview(int $id)
    {
        try {
            DB::beginTransaction();

            $review = $this->performanceReviewRepository->find($id);

            if (!$review) {
                throw new \Exception('Performance review not found');
            }

            if ($review->isRejected()) {
                throw new \Exception('Performance review is already rejected');
            }

            $this->performanceReviewRepository->update($id, [
                'status' => 'rejected'
            ]);

            DB::commit();
            return $review;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to reject performance review: ' . $e->getMessage());
            throw $e;
        }
    }

    public function submitEmployeeComments(int $id, string $employeeComments)
    {
        try {
            DB::beginTransaction();

            $review = $this->performanceReviewRepository->find($id);

            if (!$review) {
                throw new \Exception('Performance review not found');
            }

            $this->performanceReviewRepository->update($id, [
                'employee_comments' => $employeeComments
            ]);

            DB::commit();
            return $review;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to submit employee comments: ' . $e->getMessage());
            throw $e;
        }
    }
}


