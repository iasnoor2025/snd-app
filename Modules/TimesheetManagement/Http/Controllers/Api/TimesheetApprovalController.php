<?php

namespace Modules\TimesheetManagement\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Modules\TimesheetManagement\Repositories\WeeklyTimesheetRepository;
use Modules\TimesheetManagement\Actions\ApproveTimesheetAction;
use Modules\TimesheetManagement\Actions\RejectTimesheetAction;
use Modules\TimesheetManagement\Http\Requests\TimesheetApprovalRequest;
use Modules\TimesheetManagement\Http\Requests\TimesheetRejectionRequest;
use Modules\TimesheetManagement\Http\Resources\WeeklyTimesheetResource;
use Modules\Core\Http\Controllers\Api\BaseApiController;

class TimesheetApprovalController extends BaseApiController
{
    protected $weeklyTimesheetRepository;
    protected $approveTimesheetAction;
    protected $rejectTimesheetAction;

    /**
     * Constructor
     */
    public function __construct(
        WeeklyTimesheetRepository $weeklyTimesheetRepository,
        ApproveTimesheetAction $approveTimesheetAction,
        RejectTimesheetAction $rejectTimesheetAction
    ) {
        $this->weeklyTimesheetRepository = $weeklyTimesheetRepository;
        $this->approveTimesheetAction = $approveTimesheetAction;
        $this->rejectTimesheetAction = $rejectTimesheetAction;

        $this->middleware('can:timesheets.approve');
    }

    /**
     * Display a listing of the timesheets pending approval.
     * @return \Illuminate\Http\JsonResponse;
     */
    public function index()
    {
        $user = Auth::user();

        // Get filters from request
        $filters = $request->only(['employee_id', 'department_id', 'start_date', 'end_date']);
        $perPage = $request->input('per_page', 15);

        // For managers, show only their employees' timesheets by default
        if ($user->hasRole('manager') && !$request->has('show_all') && !$request->has('employee_id')) {
            $employeeIds = $user->managedEmployees()->pluck('id')->toArray();
            $filters['employee_ids'] = $employeeIds;
        }

        // Get pending timesheets
        $timesheets = $this->weeklyTimesheetRepository->getPendingTimesheets($filters, $perPage);

        return $this->respondWithPagination($timesheets, WeeklyTimesheetResource::class);
    }

    /**
     * Approve a timesheet
     * @param TimesheetApprovalRequest $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse;
     */
    public function approve(TimesheetApprovalRequest $request, $id)
    {
        try {
            $timesheet = $this->approveTimesheetAction->execute($id, $request->notes);
            return $this->respondWithSuccess(
                'Timesheet approved successfully',
                new WeeklyTimesheetResource($timesheet)
            );
        } catch (\Exception $e) {
            return $this->respondWithError($e->getMessage());
        }
    }

    /**
     * Reject a timesheet
     * @param TimesheetRejectionRequest $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse;
     */
    public function reject(TimesheetRejectionRequest $request, $id)
    {
        try {
            $timesheet = $this->rejectTimesheetAction->execute($id, $request->rejection_reason);
            return $this->respondWithSuccess(
                'Timesheet rejected successfully',
                new WeeklyTimesheetResource($timesheet)
            );
        } catch (\Exception $e) {
            return $this->respondWithError($e->getMessage());
        }
    }
}


