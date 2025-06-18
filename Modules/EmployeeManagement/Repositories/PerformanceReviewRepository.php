<?php

namespace Modules\EmployeeManagement\Repositories;

use Modules\EmployeeManagement\Domain\Models\EmployeePerformanceReview;
interface PerformanceReviewRepository
{
    public function create(array $data): EmployeePerformanceReview;
    public function update(int $id, array $data): EmployeePerformanceReview;
    public function delete(int $id): bool;
    public function find(int $id): ?EmployeePerformanceReview;
    public function getEmployeeReviews(int $employeeId): array;
    public function getPendingReviews(): array;
    public function getReviewsByReviewer(int $reviewerId): array;
    public function getReviewsByStatus(string $status): array;
    public function getEmployeeReviewsByPeriod(int $employeeId, string $startDate, string $endDate): array;
}

