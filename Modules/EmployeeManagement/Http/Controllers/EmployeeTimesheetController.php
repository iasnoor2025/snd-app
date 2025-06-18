<?php

namespace Modules\EmployeeManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\EmployeeManagement\Http\Requests\ApproveTimesheetRequest;
use Modules\EmployeeManagement\Http\Requests\BulkApproveTimesheetsRequest;
use Modules\EmployeeManagement\Http\Requests\RejectTimesheetRequest;
use Modules\EmployeeManagement\Http\Requests\StoreTimesheetRequest;
use Modules\EmployeeManagement\Http\Requests\UpdateTimesheetRequest;
use Modules\EmployeeManagement\Services\EmployeeTimesheetService;

class EmployeeTimesheetController extends Controller
{
    protected EmployeeTimesheetService $timesheetService;

    public function __construct(EmployeeTimesheetService $timesheetService)
    {
        $this->timesheetService = $timesheetService;
    }

    /**
     * Display a listing of timesheets for an employee
     */
    public function index(Request $request, int $employeeId): JsonResponse
    {
        if ($request->has('start_date') && $request->has('end_date')) {
            $startDate = \Carbon\Carbon::parse($request->input('start_date'));
            $endDate = \Carbon\Carbon::parse($request->input('end_date'));
            $timesheets = $this->timesheetService->getTimesheetsByDateRange($employeeId, $startDate, $endDate);
        } else {
            $timesheets = $this->timesheetService->getEmployeeTimesheets($employeeId);
        }

        return response()->json([
            'timesheets' => $timesheets
        ]);
    }

    /**
     * Store a newly created timesheet
     */
    public function store(StoreTimesheetRequest $request, int $employeeId): JsonResponse
    {
        // Add employee_id to the data
        $data = $request->validated();
        $data['employee_id'] = $employeeId;

        $timesheet = $this->timesheetService->createTimesheet($data);

        return response()->json([
            'message' => 'Timesheet created successfully',
            'timesheet' => $timesheet
        ], 201);
    }

    /**
     * Display the specified timesheet
     */
    public function show(int $employeeId, int $id): JsonResponse
    {
        $timesheet = $this->timesheetService->timesheetRepository->find($id);

        if (!$timesheet || $timesheet->employee_id !== $employeeId) {
            return response()->json([
                'message' => 'Timesheet not found'
            ], 404);
        }

        return response()->json([
            'timesheet' => $timesheet
        ]);
    }

    /**
     * Update the specified timesheet
     */
    public function update(UpdateTimesheetRequest $request, int $employeeId, int $id): JsonResponse
    {
        $timesheet = $this->timesheetService->timesheetRepository->find($id);

        if (!$timesheet || $timesheet->employee_id !== $employeeId) {
            return response()->json([
                'message' => 'Timesheet not found'
            ], 404);
        }

        $timesheet = $this->timesheetService->updateTimesheet($id, $request->validated());

        return response()->json([
            'message' => 'Timesheet updated successfully',
            'timesheet' => $timesheet
        ]);
    }

    /**
     * Remove the specified timesheet
     */
    public function destroy(int $employeeId, int $id): JsonResponse
    {
        $timesheet = $this->timesheetService->timesheetRepository->find($id);

        if (!$timesheet || $timesheet->employee_id !== $employeeId) {
            return response()->json([
                'message' => 'Timesheet not found'
            ], 404);
        }

        $this->timesheetService->deleteTimesheet($id);

        return response()->json([
            'message' => 'Timesheet deleted successfully'
        ]);
    }

    /**
     * Approve a timesheet
     */
    public function approve(ApproveTimesheetRequest $request, int $employeeId, int $id): JsonResponse
    {
        $timesheet = $this->timesheetService->timesheetRepository->find($id);

        if (!$timesheet || $timesheet->employee_id !== $employeeId) {
            return response()->json([
                'message' => 'Timesheet not found'
            ], 404);
        }

        $timesheet = $this->timesheetService->approveTimesheet($id, $request->user());

        return response()->json([
            'message' => 'Timesheet approved successfully',
            'timesheet' => $timesheet
        ]);
    }

    /**
     * Reject a timesheet
     */
    public function reject(RejectTimesheetRequest $request, int $employeeId, int $id): JsonResponse
    {
        $timesheet = $this->timesheetService->timesheetRepository->find($id);

        if (!$timesheet || $timesheet->employee_id !== $employeeId) {
            return response()->json([
                'message' => 'Timesheet not found'
            ], 404);
        }

        $timesheet = $this->timesheetService->rejectTimesheet($id, $request->input('reason'));

        return response()->json([
            'message' => 'Timesheet rejected successfully',
            'timesheet' => $timesheet
        ]);
    }

    /**
     * Display a listing of pending timesheets for approval
     */
    public function pending(): JsonResponse
    {
        $timesheets = $this->timesheetService->getPendingTimesheets();

        return response()->json([
            'timesheets' => $timesheets
        ]);
    }

    /**
     * Display a listing of approved timesheets for a date range
     */
    public function approved(Request $request): JsonResponse
    {
        $startDate = $request->input('start_date')
            ? \Carbon\Carbon::parse($request->input('start_date'))
            : \Carbon\Carbon::now()->startOfMonth();

        $endDate = $request->input('end_date')
            ? \Carbon\Carbon::parse($request->input('end_date'))
            : \Carbon\Carbon::now()->endOfMonth();

        $timesheets = $this->timesheetService->getApprovedTimesheets($startDate, $endDate);

        return response()->json([
            'timesheets' => $timesheets
        ]);
    }

    /**
     * Bulk approve multiple timesheets
     */
    public function bulkApprove(BulkApproveTimesheetsRequest $request): JsonResponse
    {
        $timesheets = $this->timesheetService->bulkApprove(
            $request->input('timesheet_ids'),
            $request->user()
        );

        return response()->json([
            'message' => count($timesheets) . ' timesheets approved successfully',
            'timesheets' => $timesheets
        ]);
    }

    /**
     * Get total hours for an employee in a date range
     */
    public function totalHours(Request $request, int $employeeId): JsonResponse
    {
        $startDate = $request->input('start_date')
            ? \Carbon\Carbon::parse($request->input('start_date'))
            : \Carbon\Carbon::now()->startOfMonth();

        $endDate = $request->input('end_date')
            ? \Carbon\Carbon::parse($request->input('end_date'))
            : \Carbon\Carbon::now()->endOfMonth();

        $hours = $this->timesheetService->getTotalHours($employeeId, $startDate, $endDate);

        return response()->json($hours);
    }
}


