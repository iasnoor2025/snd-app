<?php

namespace Modules\TimesheetManagement\Http\Controllers;

use Illuminate\Contracts\Support\Renderable;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Modules\TimesheetManagement\Repositories\WeeklyTimesheetRepository;
use Modules\TimesheetManagement\Actions\ApproveTimesheetAction;
use Modules\TimesheetManagement\Actions\RejectTimesheetAction;
use Modules\EmployeeManagement\Repositories\EmployeeRepository;

class TimesheetApprovalController extends Controller
{
    protected $weeklyTimesheetRepository;
    protected $employeeRepository;
    protected $approveTimesheetAction;
    protected $rejectTimesheetAction;

    /**
     * Constructor
     */
    public function __construct(
        WeeklyTimesheetRepository $weeklyTimesheetRepository,
        EmployeeRepository $employeeRepository,
        ApproveTimesheetAction $approveTimesheetAction,
        RejectTimesheetAction $rejectTimesheetAction
    ) {
        $this->weeklyTimesheetRepository = $weeklyTimesheetRepository;
        $this->employeeRepository = $employeeRepository;
        $this->approveTimesheetAction = $approveTimesheetAction;
        $this->rejectTimesheetAction = $rejectTimesheetAction;

        $this->middleware('can:timesheets.approve');
    }

    /**
     * Display a listing of the timesheets pending approval.
     * @param Request $request
     * @return Renderable;
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        // Get filters from request
        $filters = $request->only(['employee_id', 'department_id', 'start_date', 'end_date']);

        // For managers, show only their employees' timesheets by default
        if ($user->hasRole('manager') && !$request->has('show_all') && !$request->has('employee_id')) {
            $employeeIds = $this->employeeRepository->getEmployeesByManager($user->id)->pluck('id')->toArray();
            $filters['employee_ids'] = $employeeIds;
        }

        // Get pending timesheets
        $timesheets = $this->weeklyTimesheetRepository->getPendingTimesheets($filters);

        // Get employees for filter dropdown
        $employees = [];
        if ($user->can('view-all-timesheets')) {
            $employees = $this->employeeRepository->getAllActiveEmployees(['id', 'first_name', 'last_name']);
        } elseif ($user->hasRole('manager')) {
            $employees = $this->employeeRepository->getEmployeesByManager($user->id, ['id', 'first_name', 'last_name']);
        }

        return Inertia::render('TimesheetManagement::Approvals/Index', [
            'timesheets' => $timesheets,
            'employees' => $employees,
            'filters' => $filters,
            'canViewAll' => $user->can('view-all-timesheets'),
        ]);
    }

    /**
     * Approve a timesheet
     * @param TimesheetApprovalRequest $request
     * @param int $timesheetId
     * @return \Illuminate\Http\RedirectResponse;
     */
    public function approve(TimesheetApprovalRequest $request, $timesheetId)
    {
        try {
            $this->approveTimesheetAction->execute($timesheetId, $request->notes);
            return redirect()->route('timesheets.approvals.index')
                ->with('success', 'Timesheet approved successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['message' => $e->getMessage()]);
        }
    }

    /**
     * Reject a timesheet
     * @param TimesheetRejectionRequest $request
     * @param int $timesheetId
     * @return \Illuminate\Http\RedirectResponse;
     */
    public function reject(TimesheetRejectionRequest $request, $timesheetId)
    {
        try {
            $this->rejectTimesheetAction->execute($timesheetId, $request->rejection_reason);
            return redirect()->route('timesheets.approvals.index')
                ->with('success', 'Timesheet rejected successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['message' => $e->getMessage()]);
        }
    }
}


