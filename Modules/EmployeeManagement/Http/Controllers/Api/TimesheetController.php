<?php

namespace Modules\EmployeeManagement\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\EmployeeManagement\Services\EmployeeTimesheetService;

class TimesheetController extends Controller
{
    protected EmployeeTimesheetService $timesheetService;

    public function __construct(EmployeeTimesheetService $timesheetService)
    {
        $this->timesheetService = $timesheetService;
    }

    /**
     * Get pending timesheets awaiting approval
     */
    public function pending(): JsonResponse
    {
        $timesheets = $this->timesheetService->getPendingTimesheets();
        return response()->json($timesheets);
    }

    /**
     * Get approved timesheets for a date range
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
        return response()->json($timesheets);
    }

    /**
     * Get timesheets for payroll processing
     */
    public function forPayroll(Request $request): JsonResponse
    {
        $startDate = $request->input('start_date')
            ? \Carbon\Carbon::parse($request->input('start_date'))
            : \Carbon\Carbon::now()->startOfMonth();

        $endDate = $request->input('end_date')
            ? \Carbon\Carbon::parse($request->input('end_date'))
            : \Carbon\Carbon::now()->endOfMonth();

        $timesheets = $this->timesheetService->getTimesheetsForPayroll($startDate, $endDate);
        return response()->json($timesheets);
    }

    /**
     * Bulk approve timesheets
     */
    public function bulkApprove(Request $request): JsonResponse
    {
        $this->validate($request, [
            'timesheet_ids' => 'required|array',
            'timesheet_ids.*' => 'required|integer|exists:employee_timesheets,id'
        ]);

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
     * Get employee timesheets
     */
    public function byEmployee(Request $request, int $employeeId): JsonResponse
    {
        if ($request->has('start_date') && $request->has('end_date')) {
            $startDate = \Carbon\Carbon::parse($request->input('start_date'));
            $endDate = \Carbon\Carbon::parse($request->input('end_date'));
            $timesheets = $this->timesheetService->getTimesheetsByDateRange($employeeId, $startDate, $endDate);
        } else {
            $timesheets = $this->timesheetService->getEmployeeTimesheets($employeeId);
        }

        return response()->json($timesheets);
    }

    /**
     * Get total hours for an employee
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


