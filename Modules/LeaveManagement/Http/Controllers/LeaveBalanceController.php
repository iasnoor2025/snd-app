<?php

namespace Modules\LeaveManagement\Http\Controllers;

use Illuminate\Http\Request;
use Modules\EmployeeManagement\Domain\Models\Employee;
use Modules\LeaveManagement\Domain\Models\LeaveRequest;
use Modules\LeaveManagement\Domain\Models\LeaveType;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class LeaveBalanceController extends Controller
{
    /**
     * Display a listing of leave balances.
     */
    public function index(Request $request)
    {
        $query = Employee::with(['leaveRequests' => function ($query) {
            $query->where('status', 'approved')
                  ->whereYear('start_date', Carbon::now()->year);
        }])->where('status', 'active');

        // Filter by employee if specified
        if ($request->employee_id) {
            $query->where('id', $request->employee_id);
        }

        $employees = $query->get();
        $leaveTypes = LeaveType::all();

        // Calculate balances for each employee
        $balances = $employees->map(function ($employee) use ($leaveTypes) {
            $balanceData = [];

            foreach ($leaveTypes as $leaveType) {
                $usedDays = $employee->leaveRequests
                    ->where('leave_type', $leaveType->name)
                    ->sum(function ($request) {
                        return Carbon::parse($request->start_date)
                            ->diffInDays(Carbon::parse($request->end_date)) + 1;
                    });

                $balanceData[] = [
                    'type' => $leaveType->name,
                    'allocated' => $leaveType->default_days,
                    'used' => $usedDays,
                    'remaining' => max(0, $leaveType->default_days - $usedDays),
                    'percentage' => $leaveType->default_days > 0
                        ? round(($usedDays / $leaveType->default_days) * 100, 1)
                        : 0
                ];
            }

            return [
                'employee' => $employee,
                'balances' => $balanceData,
                'total_allocated' => collect($balanceData)->sum('allocated'),
                'total_used' => collect($balanceData)->sum('used'),
                'total_remaining' => collect($balanceData)->sum('remaining')
            ];
        });

        return Inertia::render('LeaveBalances/Index', [
            'balances' => $balances,
            'employees' => Employee::where('status', 'active')->get(['id', 'first_name', 'last_name']),
            'leaveTypes' => $leaveTypes,
            'filters' => $request->only(['employee_id'])
        ]);
    }

    /**
     * Display the specified employee's leave balance.
     */
    public function show($employeeId)
    {
        $employee = Employee::with(['leaveRequests' => function ($query) {
            $query->where('status', 'approved')
                  ->whereYear('start_date', Carbon::now()->year)
                  ->orderBy('start_date', 'desc');
        }])->findOrFail($employeeId);

        $leaveTypes = LeaveType::all();

        // Calculate detailed balance information
        $balanceDetails = $leaveTypes->map(function ($leaveType) use ($employee) {
            $requests = $employee->leaveRequests->where('leave_type', $leaveType->name);

            $usedDays = $requests->sum(function ($request) {
                return Carbon::parse($request->start_date)
                    ->diffInDays(Carbon::parse($request->end_date)) + 1;
            });

            return [
                'type' => $leaveType->name,
                'allocated' => $leaveType->default_days,
                'used' => $usedDays,
                'remaining' => max(0, $leaveType->default_days - $usedDays),
                'percentage' => $leaveType->default_days > 0
                    ? round(($usedDays / $leaveType->default_days) * 100, 1)
                    : 0,
                'requests' => $requests->values()
            ];
        });

        return Inertia::render('LeaveBalances/Show', [
            'employee' => $employee,
            'balanceDetails' => $balanceDetails,
            'currentYear' => Carbon::now()->year
        ]);
    }

    /**
     * Get leave balance summary for dashboard.
     */
    public function summary()
    {
        $currentYear = Carbon::now()->year;

        // Get summary statistics
        $totalEmployees = Employee::where('status', 'active')->count();
        $totalRequests = LeaveRequest::whereYear('start_date', $currentYear)->count();
        $approvedRequests = LeaveRequest::where('status', 'approved')
            ->whereYear('start_date', $currentYear)->count();
        $pendingRequests = LeaveRequest::where('status', 'pending')
            ->whereYear('start_date', $currentYear)->count();

        // Get leave type usage statistics
        $leaveTypeStats = DB::table('leave_requests')
            ->select('leave_type', DB::raw('COUNT(*) as count'), DB::raw('SUM(DATEDIFF(end_date, start_date) + 1) as total_days'))
            ->where('status', 'approved')
            ->whereYear('start_date', $currentYear)
            ->groupBy('leave_type')
            ->get();

        return response()->json([
            'summary' => [
                'total_employees' => $totalEmployees,
                'total_requests' => $totalRequests,
                'approved_requests' => $approvedRequests,
                'pending_requests' => $pendingRequests,
                'approval_rate' => $totalRequests > 0 ? round(($approvedRequests / $totalRequests) * 100, 1) : 0
            ],
            'leave_type_stats' => $leaveTypeStats,
            'current_year' => $currentYear
        ]);
    }
}
