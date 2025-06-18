<?php

namespace Modules\LeaveManagement\Http\Controllers;

use Modules\LeaveManagement\Domain\Models\LeaveRequest;
use App\Events\EmployeeReturnedFromLeave;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ReturnFromLeaveController extends Controller
{
    /**
     * Mark an employee as returned from leave
     */
    public function markReturned(Request $request, LeaveRequest $leaveRequest)
    {
        // Validate request
        $request->validate([
            'return_date' => 'required|date|after_or_equal:' . $leaveRequest->end_date,
            'notes' => 'nullable|string|max:500',
        ]);

        // Check if already returned
        if ($leaveRequest->hasReturned()) {
            return redirect()->back()->with('error', 'Employee has already been marked as returned.');
        }

        // Update leave request
        $leaveRequest->update([
            'return_date' => $request->return_date,
            'returned_by' => Auth::id(),
            'returned_at' => now(),
            'notes' => $request->notes ? $leaveRequest->notes . "\nReturn Notes: " . $request->notes : $leaveRequest->notes,
        ]);

        // Update employee status if they are on leave
        if ($leaveRequest->employee->status === 'on_leave') {
            $leaveRequest->employee->update(['status' => 'active']);
        }

        // Dispatch event
        event(new EmployeeReturnedFromLeave($leaveRequest));

        return redirect()->back()->with('success', 'Employee has been marked as returned from leave.');
    }

    /**
     * Get overdue leave requests
     */
    public function getOverdue()
    {
        $overdueRequests = LeaveRequest::with(['employee', 'approver'])
            ->where('status', 'approved')
            ->whereNull('return_date')
            ->where('end_date', '<', now())
            ->latest()
            ->paginate(10);

        return Inertia::render('LeaveRequests/Overdue', [
            'overdueRequests' => $overdueRequests,
        ]);
    }
}


