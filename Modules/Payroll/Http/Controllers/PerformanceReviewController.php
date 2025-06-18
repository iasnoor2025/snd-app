<?php
namespace Modules\Payroll\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Modules\EmployeeManagement\Services\PerformanceReviewService;

class PerformanceReviewController extends Controller
{
    protected $performanceReviewService;

    public function __construct(PerformanceReviewService $performanceReviewService)
    {
        $this->performanceReviewService = $performanceReviewService;
    }

    /**
     * Get all performance reviews with optional filtering
     */
    public function index(Request $request)
    {
        $status = $request->input('status');
        $employeeId = $request->input('employee_id');
        $reviewerId = $request->input('reviewer_id');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        if ($status) {
            $reviews = $this->performanceReviewService->getReviewsByStatus($status);
        } elseif ($employeeId && $startDate && $endDate) {
            $reviews = $this->performanceReviewService->getEmployeeReviewsByPeriod($employeeId, $startDate, $endDate);
        } elseif ($employeeId) {
            $reviews = $this->performanceReviewService->getEmployeeReviews($employeeId);
        } elseif ($reviewerId) {
            $reviews = $this->performanceReviewService->getReviewsByReviewer($reviewerId);
        } else {
            $reviews = $this->performanceReviewService->getPendingReviews();
        }

        return response()->json([;
            'status' => 'success',
            'data' => $reviews
        ]);
    }

    /**
     * Get performance review by ID
     */
    public function show(int $id)
    {
        $review = $this->performanceReviewService->getReview($id);

        if (!$review) {
            return response()->json([;
                'status' => 'error',
                'message' => 'Performance review not found'
            ], 404);
        }

        return response()->json([;
            'status' => 'success',
            'data' => $review
        ]);
    }

    /**
     * Create a new performance review
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'employee_id' => 'required|exists:employees,id',
                'reviewer_id' => 'required|exists:users,id',
                'review_date' => 'required|date',
                'review_period_start' => 'required|date',
                'review_period_end' => 'required|date|after:review_period_start',
                'job_knowledge_rating' => 'required|numeric|min:1|max:5',
                'work_quality_rating' => 'required|numeric|min:1|max:5',
                'attendance_rating' => 'required|numeric|min:1|max:5',
                'communication_rating' => 'required|numeric|min:1|max:5',
                'teamwork_rating' => 'required|numeric|min:1|max:5',
                'initiative_rating' => 'required|numeric|min:1|max:5',
                'strengths' => 'nullable|array',
                'weaknesses' => 'nullable|array',
                'goals' => 'nullable|array',
                'comments' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([;
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $review = $this->performanceReviewService->createReview($request->all());

            return response()->json([;
                'status' => 'success',
                'message' => 'Performance review created successfully',
                'data' => $review
            ], 201);
        } catch (\Exception $e) {
            return response()->json([;
                'status' => 'error',
                'message' => 'Failed to create performance review',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a performance review
     */
    public function update(Request $request, int $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'employee_id' => 'sometimes|required|exists:employees,id',
                'reviewer_id' => 'sometimes|required|exists:users,id',
                'review_date' => 'sometimes|required|date',
                'review_period_start' => 'sometimes|required|date',
                'review_period_end' => 'sometimes|required|date|after:review_period_start',
                'job_knowledge_rating' => 'sometimes|required|numeric|min:1|max:5',
                'work_quality_rating' => 'sometimes|required|numeric|min:1|max:5',
                'attendance_rating' => 'sometimes|required|numeric|min:1|max:5',
                'communication_rating' => 'sometimes|required|numeric|min:1|max:5',
                'teamwork_rating' => 'sometimes|required|numeric|min:1|max:5',
                'initiative_rating' => 'sometimes|required|numeric|min:1|max:5',
                'strengths' => 'nullable|array',
                'weaknesses' => 'nullable|array',
                'goals' => 'nullable|array',
                'comments' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([;
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Check if review exists
            $review = $this->performanceReviewService->getReview($id);
            if (!$review) {
                return response()->json([;
                    'status' => 'error',
                    'message' => 'Performance review not found'
                ], 404);
            }

            $updatedReview = $this->performanceReviewService->updateReview($id, $request->all());

            return response()->json([;
                'status' => 'success',
                'message' => 'Performance review updated successfully',
                'data' => $updatedReview
            ]);
        } catch (\Exception $e) {
            return response()->json([;
                'status' => 'error',
                'message' => 'Failed to update performance review',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a performance review
     */
    public function destroy(int $id)
    {
        try {
            // Check if review exists
            $review = $this->performanceReviewService->getReview($id);
            if (!$review) {
                return response()->json([;
                    'status' => 'error',
                    'message' => 'Performance review not found'
                ], 404);
            }

            $this->performanceReviewService->deleteReview($id);

            return response()->json([;
                'status' => 'success',
                'message' => 'Performance review deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([;
                'status' => 'error',
                'message' => 'Failed to delete performance review',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Approve a performance review
     */
    public function approve(Request $request, int $id)
    {
        try {
            // Check if review exists
            $review = $this->performanceReviewService->getReview($id);
            if (!$review) {
                return response()->json([;
                    'status' => 'error',
                    'message' => 'Performance review not found'
                ], 404);
            }

            $this->performanceReviewService->approveReview($id, Auth::id());

            return response()->json([;
                'status' => 'success',
                'message' => 'Performance review approved successfully',
                'data' => $this->performanceReviewService->getReview($id)
            ]);
        } catch (\Exception $e) {
            return response()->json([;
                'status' => 'error',
                'message' => 'Failed to approve performance review',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reject a performance review
     */
    public function reject(Request $request, int $id)
    {
        try {
            // Check if review exists
            $review = $this->performanceReviewService->getReview($id);
            if (!$review) {
                return response()->json([;
                    'status' => 'error',
                    'message' => 'Performance review not found'
                ], 404);
            }

            $this->performanceReviewService->rejectReview($id);

            return response()->json([;
                'status' => 'success',
                'message' => 'Performance review rejected successfully',
                'data' => $this->performanceReviewService->getReview($id)
            ]);
        } catch (\Exception $e) {
            return response()->json([;
                'status' => 'error',
                'message' => 'Failed to reject performance review',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Submit employee comments for a performance review
     */
    public function submitEmployeeComments(Request $request, int $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'employee_comments' => 'required|string'
            ]);

            if ($validator->fails()) {
                return response()->json([;
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Check if review exists
            $review = $this->performanceReviewService->getReview($id);
            if (!$review) {
                return response()->json([;
                    'status' => 'error',
                    'message' => 'Performance review not found'
                ], 404);
            }

            $this->performanceReviewService->submitEmployeeComments($id, $request->input('employee_comments'));

            return response()->json([;
                'status' => 'success',
                'message' => 'Employee comments submitted successfully',
                'data' => $this->performanceReviewService->getReview($id)
            ]);
        } catch (\Exception $e) {
            return response()->json([;
                'status' => 'error',
                'message' => 'Failed to submit employee comments',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}


