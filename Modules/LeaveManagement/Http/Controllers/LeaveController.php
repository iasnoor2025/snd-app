<?php

namespace Modules\LeaveManagement\Http\Controllers;

use Illuminate\Contracts\Support\Renderable;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Modules\LeaveManagement\Repositories\LeaveRepository;
use Modules\LeaveManagement\Repositories\LeaveTypeRepository;
use Modules\LeaveManagement\Http\Requests\LeaveRequest;
use Modules\LeaveManagement\Actions\CreateLeaveAction;
use Modules\LeaveManagement\Actions\UpdateLeaveAction;
use Modules\LeaveManagement\Actions\DeleteLeaveAction;
use Modules\EmployeeManagement\Repositories\EmployeeRepository;

class LeaveController extends Controller
{
    protected $leaveRepository;
    protected $leaveTypeRepository;
    protected $employeeRepository;
    protected $createLeaveAction;
    protected $updateLeaveAction;
    protected $deleteLeaveAction;

    /**
     * Constructor
     */
    public function __construct(
        LeaveRepository $leaveRepository,
        LeaveTypeRepository $leaveTypeRepository,
        EmployeeRepository $employeeRepository,
        CreateLeaveAction $createLeaveAction,
        UpdateLeaveAction $updateLeaveAction,
        DeleteLeaveAction $deleteLeaveAction
    ) {
        $this->leaveRepository = $leaveRepository;
        $this->leaveTypeRepository = $leaveTypeRepository;
        $this->employeeRepository = $employeeRepository;
        $this->createLeaveAction = $createLeaveAction;
        $this->updateLeaveAction = $updateLeaveAction;
        $this->deleteLeaveAction = $deleteLeaveAction;
    }

    /**
     * Display a listing of the resource.
     * @return Renderable;
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $employeeId = $user->employee?->id;

        // Get filters from request
        $filters = $request->only(['status', 'leave_type_id', 'start_date', 'end_date']);

        // Get employee leaves
        $leaves = $employeeId
            ? $this->leaveRepository->getEmployeeLeaves($employeeId, $filters)
            : collect([]);

        // Get leave types for filters
        $leaveTypes = $this->leaveTypeRepository->getAllActive();

        // Get counts for different statuses
        $counts = $employeeId
            ? $this->leaveRepository->countLeavesByStatus(['employee_id' => $employeeId])
            : ['pending' => 0, 'approved' => 0, 'rejected' => 0, 'total' => 0];

        return Inertia::render('LeaveRequests/Index', [
            'leaves' => $leaves,
            'leaveTypes' => $leaveTypes,
            'counts' => $counts,
            'filters' => $filters,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     * @return Renderable;
     */
    public function create()
    {
        $leaveTypes = $this->leaveTypeRepository->getAllActive();

        return Inertia::render('LeaveManagement::Create', [
            'leaveTypes' => $leaveTypes,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     * @param LeaveRequest $request
     * @return \Illuminate\Http\RedirectResponse;
     */
    public function store(LeaveRequest $request)
    {
        $this->createLeaveAction->execute($request->validated());

        return redirect()->route('leaves.index')
            ->with('success', 'Leave request created successfully.');
    }

    /**
     * Show the specified resource.
     * @param int $id
     * @return Renderable;
     */
    public function show($id)
    {
        $leave = $this->leaveRepository->findOrFail($id);

        return Inertia::render('LeaveManagement::Show', [
            'leave' => $leave->load(['leaveType', 'employee', 'approver', 'rejector'])
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     * @param int $id
     * @return Renderable;
     */
    public function edit($id)
    {
        $leave = $this->leaveRepository->findOrFail($id);
        $leaveTypes = $this->leaveTypeRepository->getAllActive();

        return Inertia::render('LeaveManagement::Edit', [
            'leave' => $leave,
            'leaveTypes' => $leaveTypes,
        ]);
    }

    /**
     * Update the specified resource in storage.
     * @param LeaveRequest $request
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse;
     */
    public function update(LeaveRequest $request, $id)
    {
        $this->updateLeaveAction->execute($id, $request->validated());

        return redirect()->route('leaves.index')
            ->with('success', 'Leave request updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse;
     */
    public function destroy($id)
    {
        $this->deleteLeaveAction->execute($id);

        return redirect()->route('leaves.index')
            ->with('success', 'Leave request deleted successfully.');
    }
}


