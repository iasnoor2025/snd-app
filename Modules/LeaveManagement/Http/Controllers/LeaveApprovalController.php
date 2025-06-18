<?php

namespace Modules\LeaveManagement\Http\Controllers;

use Illuminate\Http\Request;
use Modules\LeaveManagement\Domain\Models\LeaveRequest;
use Modules\LeaveManagement\Domain\Models\Leave;
use Modules\LeaveManagement\Actions\ApproveLeaveAction;
use Modules\LeaveManagement\Actions\RejectLeaveAction;
use Modules\EmployeeManagement\Domain\Models\Employee;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class LeaveApprovalController extends Controller
{
    /**
     * Display pending leave requests for approval.
     */
    public function index(Request $request)
    {
        $query = LeaveRequest::with(['employee:id,first_name,last_name,email', 'approver'])
            ->where('status', 'pending')
            ->when($request->employee_id, function ($query, $employeeId) {
                return $query->where('employee_id', $employeeId);
            })
            ->when($request->leave_type, function ($query, $leaveType) {
                return $query->where('leave_type', $leaveType);
            })
            ->when($request->date_from, function ($query, $dateFrom) {
                return $query->where('start_date', '>=', $dateFrom);
            })
            ->when($request->date_to, function ($query, $dateTo) {
                return $query->where('end_date', '<=', $dateTo);
            });

        // Only show requests that the current user can approve
        $user = Auth::user();
        if (!$user->hasRole(['admin', 'hr'])) {
            // Managers can only approve requests from their subordinates
            if ($user->hasRole('manager')) {
                $subordinateIds = Employee::where('manager_id', $user->employee->id)
                    ->pluck('id')
                    ->toArray();
                $query->whereIn('employee_id', $subordinateIds);
            } else {
                // Regular employees cannot approve any requests
                $query->where('id', 0); // This will return no results
            }
        }

        $pendingRequests = $query->latest()->paginate(15);

        return Inertia::render('LeaveApprovals/Index', [
            'pendingRequests' => $pendingRequests,
            'employees' => Employee::where('status', 'active')->get(['id', 'first_name', 'last_name']),
            'filters' => $request->only(['employee_id', 'leave_type', 'date_from', 'date_to'])
        ]);
    }

    /**
     * Display the specified leave request for approval.
     */
    public function show($id)
    {
        $leaveRequest = LeaveRequest::with([
            'employee:id,first_name,last_name,email,employee_id,department,position',
            'approver:id,first_name,last_name'
        ])->findOrFail($id);

        // Check if user can view this request
        $user = Auth::user();
        if (!$user->hasRole(['admin', 'hr'])) {
            if ($user->hasRole('manager')) {
                $subordinateIds = Employee::where('manager_id', $user->employee->id)
                    ->pluck('id')
                    ->toArray();
                if (!in_array($leaveRequest->employee_id, $subordinateIds)) {
                    abort(403, 'Unauthorized to view this leave request.');
                }
            } else {
                abort(403, 'Unauthorized to view this leave request.');
            }
        }

        // Get employee's leave history for context
        $leaveHistory = LeaveRequest::where('employee_id', $leaveRequest->employee_id)
            ->where('id', '!=', $leaveRequest->id)
            ->where('status', 'approved')
            ->whereYear('start_date', Carbon::now()->year)
            ->orderBy('start_date', 'desc')
            ->limit(5)
            ->get();

        // Calculate leave balance for this employee
        $currentYearRequests = LeaveRequest::where('employee_id', $leaveRequest->employee_id)
            ->where('status', 'approved')
            ->whereYear('start_date', Carbon::now()->year)
            ->get();

        $leaveBalance = [
            'annual' => 21, // Default annual leave days
            'sick' => 10,   // Default sick leave days
            'personal' => 5, // Default personal leave days
        ];

        foreach ($currentYearRequests as $request) {
            $days = Carbon::parse($request->start_date)->diffInDays(Carbon::parse($request->end_date)) + 1;
            if (isset($leaveBalance[$request->leave_type])) {
                $leaveBalance[$request->leave_type] -= $days;
            }
        }

        return Inertia::render('LeaveApprovals/Show', [
            'leaveRequest' => $leaveRequest,
            'leaveHistory' => $leaveHistory,
            'leaveBalance' => $leaveBalance
        ]);
    }

    /**
     * Approve a leave request.
     */
    public function approve(Request $request, $id, ApproveLeaveAction $approveLeaveAction)
    {
        $leaveRequest = Leave::findOrFail($id);
        $user = Auth::user();

        // Check if user can approve this request
        if (!$user->hasRole(['admin', 'hr'])) {
            if ($user->hasRole('manager')) {
                $subordinateIds = Employee::where('manager_id', $user->employee->id)
                    ->pluck('id')
                    ->toArray();
                if (!in_array($leaveRequest->employee_id, $subordinateIds)) {
                    return redirect()->back()->with('error', 'Unauthorized to approve this leave request.');
                }
            } else {
                return redirect()->back()->with('error', 'Unauthorized to approve this leave request.');
            }
        }

        if ($leaveRequest->status !== 'pending') {
            return redirect()->back()->with('error', 'This leave request has already been processed.');
        }

        $request->validate([
            'approval_notes' => 'nullable|string|max:500'
        ]);

        try {
            // Use the ApproveLeaveAction for better business logic handling
            $approvedLeave = $approveLeaveAction->execute($leaveRequest, [
                'approved_by' => $user->employee->id,
                'approval_notes' => $request->approval_notes,
            ]);

            return redirect()->route('leaves.approvals.index')
                ->with('success', 'Leave request approved successfully.');
        } catch (ValidationException $e) {
            return redirect()->back()
                ->withErrors($e->errors());
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to approve leave request: ' . $e->getMessage());
        }
    }

    /**
     * Reject a leave request.
     */
    public function reject(Request $request, $id, RejectLeaveAction $rejectLeaveAction)
    {
        $leaveRequest = Leave::findOrFail($id);
        $user = Auth::user();

        // Check if user can reject this request
        if (!$user->hasRole(['admin', 'hr'])) {
            if ($user->hasRole('manager')) {
                $subordinateIds = Employee::where('manager_id', $user->employee->id)
                    ->pluck('id')
                    ->toArray();
                if (!in_array($leaveRequest->employee_id, $subordinateIds)) {
                    return redirect()->back()->with('error', 'Unauthorized to reject this leave request.');
                }
            } else {
                return redirect()->back()->with('error', 'Unauthorized to reject this leave request.');
            }
        }

        if ($leaveRequest->status !== 'pending') {
            return redirect()->back()->with('error', 'This leave request has already been processed.');
        }

        $request->validate([
            'rejection_reason' => 'required|string|max:500'
        ]);

        try {
            // Use the RejectLeaveAction for better business logic handling
            $rejectedLeave = $rejectLeaveAction->execute($leaveRequest, [
                'rejected_by' => $user->employee->id,
                'rejection_reason' => $request->rejection_reason,
            ]);

            return redirect()->route('leaves.approvals.index')
                ->with('success', 'Leave request rejected.');
        } catch (ValidationException $e) {
            return redirect()->back()
                ->withErrors($e->errors());
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to reject leave request: ' . $e->getMessage());
        }
    }

    /**
     * Bulk approve multiple leave requests.
     */
    public function bulkApprove(Request $request)
    {
        $request->validate([
            'request_ids' => 'required|array',
            'request_ids.*' => 'exists:leave_requests,id',
            'approval_notes' => 'nullable|string|max:500'
        ]);

        $user = Auth::user();
        $approvedCount = 0;

        DB::transaction(function () use ($request, $user, &$approvedCount) {
            $leaveRequests = LeaveRequest::whereIn('id', $request->request_ids)
                ->where('status', 'pending')
                ->get();

            foreach ($leaveRequests as $leaveRequest) {
                // Check authorization for each request
                if (!$user->hasRole(['admin', 'hr'])) {
                    if ($user->hasRole('manager')) {
                        $subordinateIds = Employee::where('manager_id', $user->employee->id)
                            ->pluck('id')
                            ->toArray();
                        if (!in_array($leaveRequest->employee_id, $subordinateIds)) {
                            continue; // Skip this request
                        }
                    } else {
                        continue; // Skip this request
                    }
                }

                $leaveRequest->update([
                    'status' => 'approved',
                    'approved_by' => $user->employee->id,
                    'approved_at' => now(),
                    'approval_notes' => $request->approval_notes
                ]);

                $approvedCount++;

                // Log the approval activity
                activity()
                    ->performedOn($leaveRequest)
                    ->causedBy($user)
                    ->withProperties([
                        'action' => 'bulk_approved',
                        'notes' => $request->approval_notes
                    ])
                    ->log('Leave request bulk approved');
            }
        });

        return redirect()->route('leaves.approvals.index')
            ->with('success', "Successfully approved {$approvedCount} leave request(s).");
    }

    /**
     * Get approval statistics for dashboard.
     */
    public function statistics()
    {
        $currentMonth = Carbon::now();
        $user = Auth::user();

        $baseQuery = LeaveRequest::query();

        // Apply user-specific filters
        if (!$user->hasRole(['admin', 'hr'])) {
            if ($user->hasRole('manager')) {
                $subordinateIds = Employee::where('manager_id', $user->employee->id)
                    ->pluck('id')
                    ->toArray();
                $baseQuery->whereIn('employee_id', $subordinateIds);
            } else {
                return response()->json([
                    'pending_count' => 0,
                    'approved_this_month' => 0,
                    'rejected_this_month' => 0,
                    'total_this_month' => 0
                ]);
            }
        }

        $statistics = [
            'pending_count' => (clone $baseQuery)->where('status', 'pending')->count(),
            'approved_this_month' => (clone $baseQuery)
                ->where('status', 'approved')
                ->whereMonth('approved_at', $currentMonth->month)
                ->whereYear('approved_at', $currentMonth->year)
                ->count(),
            'rejected_this_month' => (clone $baseQuery)
                ->where('status', 'rejected')
                ->whereMonth('rejected_at', $currentMonth->month)
                ->whereYear('rejected_at', $currentMonth->year)
                ->count(),
            'total_this_month' => (clone $baseQuery)
                ->whereMonth('created_at', $currentMonth->month)
                ->whereYear('created_at', $currentMonth->year)
                ->count()
        ];

        return response()->json($statistics);
    }
}
