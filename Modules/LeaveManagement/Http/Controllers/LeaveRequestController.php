<?php

namespace Modules\LeaveManagement\Http\Controllers;

use Modules\EmployeeManagement\Domain\Models\Employee;
use Modules\LeaveManagement\Domain\Models\LeaveRequest;
use Modules\LeaveManagement\Domain\Models\Leave;
use Modules\LeaveManagement\Actions\CreateLeaveAction;
use Modules\LeaveManagement\Actions\UpdateLeaveAction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class LeaveRequestController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = LeaveRequest::with(['employee:id,first_name,last_name', 'approver'])
            ->when($request->status, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->when($request->employee_id, function ($query, $employeeId) {
                return $query->where('employee_id', $employeeId);
            });

        // If user is not admin/hr, only show their own requests
        if (!auth()->user()->hasRole(['admin', 'hr'])) {
            $query->where('employee_id', auth()->user()->employee->id);
        }

        $leaveRequests = $query->latest()->paginate(10);

        return Inertia::render('LeaveRequests/Index', [
            'leaveRequests' => $leaveRequests,
            'filters' => $request->only(['status', 'employee_id'])
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $user = Auth::user();

        if ($user->isAdmin() || $user->hasRole('manager')) {
            // Admins and managers can create leave requests for any employee
            $employees = Employee::where('status', 'active')->get();

            return Inertia::render('LeaveRequests/Create', [
                'employees' => $employees,
            ]);
        } else {
            // Regular employees can only create leave requests for themselves
            // Instead of passing a single employee, we pass an array with just their employee
            return Inertia::render('LeaveRequests/Create', [
                'employees' => $user->employee ? [$user->employee] : [],
                'currentUserOnly' => true
            ]);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, CreateLeaveAction $createLeaveAction)
    {
        $user = Auth::user();

        $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after_or_equal:start_date',
            'leave_type' => 'required|in:annual,vacation,sick,personal,maternity,hajj,umrah,unpaid,other',
            'reason' => 'required|string',
        ]);

        // Check if user has permission to create leave request for this employee
        if (!$user->isAdmin() && !$user->hasRole('manager')) {
            if ($user->employee->id != $request->employee_id) {
                return redirect()->back()->with('error', 'You do not have permission to create leave requests for other employees.');
            }
        }

        // Map leave_type string to leave_type_id
        $leaveType = \Modules\LeaveManagement\Domain\Models\LeaveType::where('name', $request->leave_type)->first();
        if (!$leaveType) {
            return redirect()->back()->withErrors(['leave_type' => 'Invalid leave type'])->withInput();
        }

        try {
            // Use the CreateLeaveAction for better business logic handling
            $leave = $createLeaveAction->execute([
                'employee_id' => $request->employee_id,
                'leave_type_id' => $leaveType->id,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'leave_type' => $request->leave_type,
                'reason' => $request->reason,
                'requested_by' => $user->id,
            ]);

            return redirect()->route('leaves.requests.index')
                ->with('success', 'Leave request submitted successfully.');
        } catch (ValidationException $e) {
            return redirect()->back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to create leave request: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(LeaveRequest $leaveRequest)
    {
        $user = Auth::user();

        // Check if user has permission to view this leave request
        if (!$user->isAdmin() && !$user->hasRole('manager')) {
            if ($user->employee->id != $leaveRequest->employee_id) {
                return redirect()->route('leaves.requests.index')
                    ->with('error', 'You do not have permission to view this leave request.');
            }
        }

        $leaveRequest->load(['employee', 'approver']);

        return Inertia::render('LeaveRequests/Show', [
            'leaveRequest' => $leaveRequest,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(LeaveRequest $leaveRequest)
    {
        $user = Auth::user();

        // Check if user has permission to edit this leave request
        if (!$user->isAdmin() && !$user->hasRole('manager')) {
            if ($user->employee->id != $leaveRequest->employee_id) {
                return redirect()->route('leaves.requests.index')
                    ->with('error', 'You do not have permission to edit this leave request.');
            }
        }

        // Only pending leave requests can be edited
        if ($leaveRequest->status !== 'pending') {
            return redirect()->route('leaves.requests.index')
                ->with('error', 'Only pending leave requests can be edited.');
        }

        $leaveRequest->load('employee');

        if ($user->isAdmin() || $user->hasRole('manager')) {
            $employees = Employee::where('status', 'active')->get();

            return Inertia::render('LeaveRequests/Edit', [
                'leaveRequest' => $leaveRequest,
                'employees' => $employees,
            ]);
        } else {
            return Inertia::render('LeaveRequests/Edit', [
                'leaveRequest' => $leaveRequest,
            ]);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, LeaveRequest $leaveRequest, UpdateLeaveAction $updateLeaveAction)
    {
        $user = Auth::user();

        // Check if user has permission to update this leave request
        if (!$user->isAdmin() && !$user->hasRole('manager')) {
            if ($user->employee->id != $leaveRequest->employee_id) {
                return redirect()->back()->with('error', 'You do not have permission to update this leave request.');
            }
        }

        // Only allow updates if status is pending
        if ($leaveRequest->status !== 'pending') {
            return redirect()->back()->with('error', 'Cannot update leave request that has already been processed.');
        }

        $request->validate([
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after_or_equal:start_date',
            'leave_type' => 'required|in:annual,vacation,sick,personal,maternity,hajj,umrah,unpaid,other',
            'reason' => 'required|string',
        ]);

        try {
            // Use the UpdateLeaveAction for better business logic handling
            $updatedLeave = $updateLeaveAction->execute($leaveRequest, [
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'leave_type' => $request->leave_type,
                'reason' => $request->reason,
                'updated_by' => $user->id,
            ]);

            return redirect()->route('leaves.requests.index')
                ->with('success', 'Leave request updated successfully.');
        } catch (ValidationException $e) {
            return redirect()->back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to update leave request: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(LeaveRequest $leaveRequest)
    {
        $user = Auth::user();

        // Check if user has permission to delete this leave request
        if (!$user->isAdmin() && !$user->hasRole('manager')) {
            if ($user->employee->id != $leaveRequest->employee_id) {
                return redirect()->route('leaves.requests.index')
                    ->with('error', 'You do not have permission to delete this leave request.');
            }
        }

        // Only pending leave requests can be deleted by non-admin users
        if (!$user->isAdmin() && $leaveRequest->status !== 'pending') {
            return redirect()->route('leaves.requests.index')
                ->with('error', 'Only pending leave requests can be deleted.');
        }

        // If the leave request was approved and the employee is on leave, update their status back to active
        if ($leaveRequest->status === 'approved' && $leaveRequest->employee->status === 'on_leave') {
            $leaveRequest->employee->update(['status' => 'active']);
        }

        $leaveRequest->delete();

        return redirect()->route('leaves.requests.index')
            ->with('success', 'Leave request deleted successfully.');
    }

    /**
     * Approve a leave request.
     */
    public function approve(LeaveRequest $leaveRequest)
    {
        $user = Auth::user();

        // Check if user has permission to approve leave requests
        if (!$user->isAdmin() && !$user->hasRole('manager')) {
            return redirect()->route('leaves.requests.index')
                ->with('error', 'You do not have permission to approve leave requests.');
        }

        // Only pending leave requests can be approved
        if ($leaveRequest->status !== 'pending') {
            return redirect()->route('leaves.requests.index')
                ->with('error', 'Only pending leave requests can be approved.');
        }

        // Update leave request
        $leaveRequest->update([
            'status' => 'approved',
            'approved_by' => $user->id,
            'approved_at' => now(),
        ]);

        // Update employee status to on_leave
        $leaveRequest->employee->update(['status' => 'on_leave']);

        return redirect()->route('leaves.requests.index')
            ->with('success', 'Leave request approved successfully.');
    }

    /**
     * Reject a leave request.
     */
    public function reject(Request $request, LeaveRequest $leaveRequest)
    {
        $user = Auth::user();

        // Check if user has permission to reject leave requests
        if (!$user->isAdmin() && !$user->hasRole('manager')) {
            return redirect()->route('leaves.requests.index')
                ->with('error', 'You do not have permission to reject leave requests.');
        }

        // Only pending leave requests can be rejected
        if ($leaveRequest->status !== 'pending') {
            return redirect()->route('leaves.requests.index')
                ->with('error', 'Only pending leave requests can be rejected.');
        }

        $request->validate([
            'rejection_reason' => 'required|string'
        ]);

        $leaveRequest->update([
            'status' => 'rejected',
            'rejection_reason' => $request->rejection_reason,
            'approved_by' => $user->id,
            'approved_at' => now(),
        ]);

        return redirect()->route('leaves.requests.index')
            ->with('success', 'Leave request rejected successfully.');
    }
}


