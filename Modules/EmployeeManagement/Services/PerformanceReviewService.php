<?php

namespace Modules\EmployeeManagement\Services;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Modules\EmployeeManagement\Repositories\PerformanceReviewRepository;

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

    public function createReview(array $data)
    {
        try {
            DB::beginTransaction();

            // Calculate overall rating from individual category ratings
            if (!isset($data['overall_rating'])) {
                $categoryRatings = [
                    $data['job_knowledge_rating'],
                    $data['work_quality_rating'],
                    $data['attendance_rating'],
                    $data['communication_rating'],
                    $data['teamwork_rating'],
                    $data['initiative_rating']
                ];
                $data['overall_rating'] = array_sum($categoryRatings) / count($categoryRatings);
            }

            // Ensure arrays are properly formatted
            foreach (['strengths', 'weaknesses', 'goals'] as $arrayField) {
                if (isset($data[$arrayField]) && is_string($data[$arrayField])) {
                    $data[$arrayField] = json_decode($data[$arrayField], true);
                }
            }

            $review = $this->performanceReviewRepository->create($data);

            DB::commit();
            return $review;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create performance review: ' . $e->getMessage());
            throw $e;
        }
    }

    public function updateReview(int $id, array $data)
    {
        try {
            DB::beginTransaction();

            // Recalculate overall rating if category ratings are provided
            $categoryFields = [
                'job_knowledge_rating',
                'work_quality_rating',
                'attendance_rating',
                'communication_rating',
                'teamwork_rating',
                'initiative_rating',
            ];

            $hasAllRatings = true;
            $ratingSum = 0;
            $review = $this->performanceReviewRepository->find($id);

            foreach ($categoryFields as $field) {
                if (isset($data[$field])) {
                    $ratingSum += $data[$field];
                } elseif (isset($review->$field)) {
                    $ratingSum += $review->$field;
                } else {
                    $hasAllRatings = false;
                    break;
                }
            }

            if ($hasAllRatings && !isset($data['overall_rating'])) {
                $data['overall_rating'] = $ratingSum / count($categoryFields);
            }

            // Ensure arrays are properly formatted
            foreach (['strengths', 'weaknesses', 'goals'] as $arrayField) {
                if (isset($data[$arrayField]) && is_string($data[$arrayField])) {
                    $data[$arrayField] = json_decode($data[$arrayField], true);
                }
            }

            $review = $this->performanceReviewRepository->update($id, $data);

            DB::commit();
            return $review;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to update performance review: ' . $e->getMessage());
            throw $e;
        }
    }

    public function deleteReview(int $id)
    {
        try {
            DB::beginTransaction();

            $result = $this->performanceReviewRepository->delete($id);

            DB::commit();
            return $result;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to delete performance review: ' . $e->getMessage());
            throw $e;
        }
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


