<?php

namespace Modules\EmployeeManagement\Repositories;

use Modules\EmployeeManagement\Domain\Models\EmployeePerformanceReview;

class EloquentPerformanceReviewRepository implements PerformanceReviewRepository
{
    public function create(array $data): EmployeePerformanceReview
    {
        return EmployeePerformanceReview::create($data);
    }

    public function update(int $id, array $data): EmployeePerformanceReview
    {
        $review = $this->find($id);
        $review->update($data);
        return $review;
    }

    public function delete(int $id): bool
    {
        $review = $this->find($id);
        if (!$review) {
            return false;
        }

        return $review->delete();
    }

    public function find(int $id): ?EmployeePerformanceReview
    {
        return EmployeePerformanceReview::with(['employee', 'reviewer', 'approver'])->find($id);
    }

    public function getEmployeeReviews(int $employeeId): array
    {
        return EmployeePerformanceReview::with(['reviewer', 'approver'])
            ->where('employee_id', $employeeId)
            ->orderBy('review_date', 'desc')
            ->get()
            ->toArray();
    }

    public function getPendingReviews(): array
    {
        return EmployeePerformanceReview::with(['employee', 'reviewer'])
            ->where('status', 'pending')
            ->orderBy('review_date', 'desc')
            ->get()
            ->toArray();
    }

    public function getReviewsByReviewer(int $reviewerId): array
    {
        return EmployeePerformanceReview::with(['employee', 'approver'])
            ->where('reviewer_id', $reviewerId)
            ->orderBy('review_date', 'desc')
            ->get()
            ->toArray();
    }

    public function getReviewsByStatus(string $status): array
    {
        return EmployeePerformanceReview::with(['employee', 'reviewer', 'approver'])
            ->where('status', $status)
            ->orderBy('review_date', 'desc')
            ->get()
            ->toArray();
    }

    public function getEmployeeReviewsByPeriod(int $employeeId, string $startDate, string $endDate): array
    {
        return EmployeePerformanceReview::with(['reviewer', 'approver'])
            ->where('employee_id', $employeeId)
            ->whereBetween('review_date', [$startDate, $endDate])
            ->orderBy('review_date', 'desc')
            ->get()
            ->toArray();
    }
}

