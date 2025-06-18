<?php

namespace Modules\TimesheetManagement\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Modules\TimesheetManagement\Http\Controllers\Controller;
use Modules\TimesheetManagement\Domain\Models\Timesheet;
use Modules\TimesheetManagement\Services\TimesheetService;

class TimesheetController extends Controller
{
    protected $timesheetService;

    public function __construct(TimesheetService $timesheetService)
    {
        $this->timesheetService = $timesheetService;
    }

    /**
     * Display a listing of the resource.
     * @return Response
     */
    public function index(Request $request)
    {
        try {
            $timesheets = $this->timesheetService->getAllTimesheets($request->all());
            return response()->json([
                'success' => true,
                'data' => $timesheets,
                'message' => 'Timesheets retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving timesheets: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     * @param Request $request
     * @return Response
     */
    public function store(Request $request)
    {
        try {
            $timesheet = $this->timesheetService->createTimesheet($request->all());
            return response()->json([
                'success' => true,
                'data' => $timesheet,
                'message' => 'Timesheet created successfully'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating timesheet: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show the specified resource.
     * @param int $id
     * @return Response
     */
    public function show($id)
    {
        try {
            $timesheet = $this->timesheetService->getTimesheetById($id);
            return response()->json([
                'success' => true,
                'data' => $timesheet,
                'message' => 'Timesheet retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving timesheet: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     * @param Request $request
     * @param int $id
     * @return Response
     */
    public function update(Request $request, $id)
    {
        try {
            $timesheet = $this->timesheetService->updateTimesheet($id, $request->all());
            return response()->json([
                'success' => true,
                'data' => $timesheet,
                'message' => 'Timesheet updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating timesheet: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     * @param int $id
     * @return Response
     */
    public function destroy($id)
    {
        try {
            $this->timesheetService->deleteTimesheet($id);
            return response()->json([
                'success' => true,
                'message' => 'Timesheet deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting timesheet: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Submit timesheet for approval.
     * @param Request $request
     * @param int $id
     * @return Response
     */
    public function submit(Request $request, $id)
    {
        try {
            $timesheet = $this->timesheetService->submitTimesheet($id);
            return response()->json([
                'success' => true,
                'data' => $timesheet,
                'message' => 'Timesheet submitted for approval'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error submitting timesheet: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Approve timesheet.
     * @param Request $request
     * @param int $id
     * @return Response
     */
    public function approve(Request $request, $id)
    {
        try {
            $timesheet = $this->timesheetService->approveTimesheet($id, $request->input('comments'));
            return response()->json([
                'success' => true,
                'data' => $timesheet,
                'message' => 'Timesheet approved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error approving timesheet: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reject timesheet.
     * @param Request $request
     * @param int $id
     * @return Response
     */
    public function reject(Request $request, $id)
    {
        try {
            $timesheet = $this->timesheetService->rejectTimesheet($id, $request->input('comments'));
            return response()->json([
                'success' => true,
                'data' => $timesheet,
                'message' => 'Timesheet rejected'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error rejecting timesheet: ' . $e->getMessage()
            ], 500);
        }
    }
}
