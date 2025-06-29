<?php

namespace Modules\EmployeeManagement\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Modules\EmployeeManagement\Services\PerformanceReviewService;
use Modules\EmployeeManagement\Domain\Models\PerformanceReview;
use Modules\EmployeeManagement\Domain\Models\Employee;

class PerformanceReviewController extends Controller
{
    public function __construct(private PerformanceReviewService $reviewService) {}

    public function index(Employee $employee)
    {
        return response()->json([
            'data' => $this->reviewService->getReviewsForEmployee($employee),
        ]);
    }

    public function store(Request $request, Employee $employee)
    {
        $data = $request->validate([
            'reviewer_id' => 'required|exists:employees,id',
            'review_date' => 'required|date',
            'job_knowledge_rating' => 'required|integer|min:1|max:5',
            'work_quality_rating' => 'required|integer|min:1|max:5',
            'attendance_rating' => 'required|integer|min:1|max:5',
            'communication_rating' => 'required|integer|min:1|max:5',
            'teamwork_rating' => 'required|integer|min:1|max:5',
            'initiative_rating' => 'required|integer|min:1|max:5',
            'overall_rating' => 'nullable|numeric',
            'strengths' => 'nullable|array',
            'weaknesses' => 'nullable|array',
            'goals' => 'nullable|array',
            'comments' => 'nullable|string',
        ]);
        $data['employee_id'] = $employee->id;
        if (!isset($data['overall_rating'])) {
            $ratings = [
                $data['job_knowledge_rating'],
                $data['work_quality_rating'],
                $data['attendance_rating'],
                $data['communication_rating'],
                $data['teamwork_rating'],
                $data['initiative_rating'],
            ];
            $data['overall_rating'] = array_sum($ratings) / count($ratings);
        }
        $review = $this->reviewService->createReview($data);
        return response()->json(['message' => 'Review created', 'data' => $review]);
    }

    public function update(Request $request, Employee $employee, PerformanceReview $review)
    {
        $data = $request->validate([
            'reviewer_id' => 'sometimes|exists:employees,id',
            'review_date' => 'sometimes|date',
            'job_knowledge_rating' => 'sometimes|integer|min:1|max:5',
            'work_quality_rating' => 'sometimes|integer|min:1|max:5',
            'attendance_rating' => 'sometimes|integer|min:1|max:5',
            'communication_rating' => 'sometimes|integer|min:1|max:5',
            'teamwork_rating' => 'sometimes|integer|min:1|max:5',
            'initiative_rating' => 'sometimes|integer|min:1|max:5',
            'overall_rating' => 'nullable|numeric',
            'strengths' => 'nullable|array',
            'weaknesses' => 'nullable|array',
            'goals' => 'nullable|array',
            'comments' => 'nullable|string',
        ]);
        if (!isset($data['overall_rating'])) {
            $ratings = [
                $data['job_knowledge_rating'] ?? $review->job_knowledge_rating,
                $data['work_quality_rating'] ?? $review->work_quality_rating,
                $data['attendance_rating'] ?? $review->attendance_rating,
                $data['communication_rating'] ?? $review->communication_rating,
                $data['teamwork_rating'] ?? $review->teamwork_rating,
                $data['initiative_rating'] ?? $review->initiative_rating,
            ];
            $data['overall_rating'] = array_sum($ratings) / count($ratings);
        }
        $updated = $this->reviewService->updateReview($review, $data);
        return response()->json(['message' => 'Review updated', 'data' => $updated]);
    }

    public function destroy(Employee $employee, PerformanceReview $review)
    {
        $this->reviewService->deleteReview($review);
        return response()->json(['message' => 'Review deleted']);
    }
}
