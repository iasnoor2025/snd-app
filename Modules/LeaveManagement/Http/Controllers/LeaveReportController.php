<?php

namespace Modules\LeaveManagement\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Modules\LeaveManagement\Domain\Leave\Models\Leave;
use Modules\LeaveManagement\Domain\Leave\Models\LeaveType;
use Modules\EmployeeManagement\Domain\Employee\Models\Employee;
use Maatwebsite\Excel\Facades\Excel;
use Modules\LeaveManagement\Exports\LeaveReportExport;

class LeaveReportController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:leave-reports.view');
    }

    /**
     * Display leave reports dashboard.
     */
    public function index(Request $request)
    {
        $filters = $request->only([
            'date_from', 'date_to', 'employee_id', 'department_id',
            'leave_type_id', 'status', 'report_type'
        ]);

        // Default date range (current month)
        $dateFrom = $request->get('date_from', now()->startOfMonth()->format('Y-m-d'));
        $dateTo = $request->get('date_to', now()->endOfMonth()->format('Y-m-d'));
        $reportType = $request->get('report_type', 'summary');

        $data = [];

        switch ($reportType) {
            case 'summary':
                $data = $this->getSummaryReport($dateFrom, $dateTo, $filters);
                break;
            case 'detailed':
                $data = $this->getDetailedReport($dateFrom, $dateTo, $filters);
                break;
            case 'balance':
                $data = $this->getBalanceReport($filters);
                break;
            case 'trends':
                $data = $this->getTrendsReport($dateFrom, $dateTo, $filters);
                break;
            case 'department':
                $data = $this->getDepartmentReport($dateFrom, $dateTo, $filters);
                break;
        }

        return Inertia::render('LeaveManagement/Reports/Index', [
            'filters' => $filters + ['date_from' => $dateFrom, 'date_to' => $dateTo, 'report_type' => $reportType],
            'data' => $data,
            'employees' => $this->getEmployeeOptions(),
            'departments' => $this->getDepartmentOptions(),
            'leaveTypes' => $this->getLeaveTypeOptions(),
        ]);
    }

    /**
     * Get summary report data.
     */
    private function getSummaryReport(string $dateFrom, string $dateTo, array $filters): array
    {
        $query = Leave::with(['employee', 'leaveType'])
            ->whereBetween('start_date', [$dateFrom, $dateTo]);

        $this->applyFilters($query, $filters);

        $leaves = $query->get();

        return [
            'total_requests' => $leaves->count(),
            'approved_requests' => $leaves->where('status', 'approved')->count(),
            'pending_requests' => $leaves->where('status', 'pending')->count(),
            'rejected_requests' => $leaves->where('status', 'rejected')->count(),
            'total_days' => $leaves->where('status', 'approved')->sum('total_days'),
            'by_leave_type' => $leaves->groupBy('leave_type_id')->map(function ($group) {
                return [
                    'leave_type' => $group->first()->leaveType->name,
                    'count' => $group->count(),
                    'total_days' => $group->where('status', 'approved')->sum('total_days'),
                ];
            })->values(),
            'by_status' => $leaves->groupBy('status')->map(function ($group, $status) {
                return [
                    'status' => ucfirst($status),
                    'count' => $group->count(),
                    'percentage' => $group->count(),
                ];
            })->values(),
            'monthly_trend' => $this->getMonthlyTrend($dateFrom, $dateTo, $filters),
        ];
    }

    /**
     * Get detailed report data.
     */
    private function getDetailedReport(string $dateFrom, string $dateTo, array $filters): array
    {
        $query = Leave::with(['employee.department', 'leaveType', 'approver', 'rejector'])
            ->whereBetween('start_date', [$dateFrom, $dateTo]);

        $this->applyFilters($query, $filters);

        $leaves = $query->orderBy('created_at', 'desc')->paginate(50);

        return [
            'leaves' => $leaves->through(function ($leave) {
                return [
                    'id' => $leave->id,
                    'employee' => [
                        'id' => $leave->employee->id,
                        'name' => $leave->employee->full_name,
                        'employee_id' => $leave->employee->employee_id,
                        'department' => $leave->employee->department->name ?? 'N/A',
                    ],
                    'leave_type' => [
                        'id' => $leave->leaveType->id,
                        'name' => $leave->leaveType->name,
                        'color' => $leave->leaveType->color ?? '#3B82F6',
                    ],
                    'start_date' => $leave->start_date->format('Y-m-d'),
                    'end_date' => $leave->end_date->format('Y-m-d'),
                    'total_days' => $leave->total_days,
                    'status' => $leave->status,
                    'reason' => $leave->reason,
                    'applied_at' => $leave->created_at->format('Y-m-d H:i'),
                    'approved_at' => $leave->approved_at?->format('Y-m-d H:i'),
                    'approver' => $leave->approver ? [
                        'name' => $leave->approver->full_name,
                        'employee_id' => $leave->approver->employee_id,
                    ] : null,
                ];
            }),
            'pagination' => [
                'current_page' => $leaves->currentPage(),
                'last_page' => $leaves->lastPage(),
                'per_page' => $leaves->perPage(),
                'total' => $leaves->total(),
            ],
        ];
    }

    /**
     * Get balance report data.
     */
    private function getBalanceReport(array $filters): array
    {
        $query = Employee::with(['department', 'leaveBalances.leaveType'])
            ->whereHas('leaveBalances');

        if (!empty($filters['department_id'])) {
            $query->where('department_id', $filters['department_id']);
        }

        if (!empty($filters['employee_id'])) {
            $query->where('id', $filters['employee_id']);
        }

        $employees = $query->get();

        return [
            'employees' => $employees->map(function ($employee) {
                return [
                    'id' => $employee->id,
                    'name' => $employee->full_name,
                    'employee_id' => $employee->employee_id,
                    'department' => $employee->department->name ?? 'N/A',
                    'balances' => $employee->leaveBalances->map(function ($balance) {
                        return [
                            'leave_type' => $balance->leaveType->name,
                            'allocated' => $balance->allocated_days,
                            'used' => $balance->used_days,
                            'remaining' => $balance->remaining_days,
                            'carried_forward' => $balance->carried_forward_days,
                        ];
                    }),
                    'total_allocated' => $employee->leaveBalances->sum('allocated_days'),
                    'total_used' => $employee->leaveBalances->sum('used_days'),
                    'total_remaining' => $employee->leaveBalances->sum('remaining_days'),
                ];
            }),
        ];
    }

    /**
     * Get trends report data.
     */
    private function getTrendsReport(string $dateFrom, string $dateTo, array $filters): array
    {
        $monthlyData = $this->getMonthlyTrend($dateFrom, $dateTo, $filters);
        $yearlyComparison = $this->getYearlyComparison($filters);
        $seasonalAnalysis = $this->getSeasonalAnalysis($filters);

        return [
            'monthly_trend' => $monthlyData,
            'yearly_comparison' => $yearlyComparison,
            'seasonal_analysis' => $seasonalAnalysis,
            'peak_periods' => $this->getPeakPeriods($filters),
        ];
    }

    /**
     * Get department report data.
     */
    private function getDepartmentReport(string $dateFrom, string $dateTo, array $filters): array
    {
        $query = DB::table('leaves')
            ->join('employees', 'leaves.employee_id', '=', 'employees.id')
            ->join('departments', 'employees.department_id', '=', 'departments.id')
            ->join('leave_types', 'leaves.leave_type_id', '=', 'leave_types.id')
            ->whereBetween('leaves.start_date', [$dateFrom, $dateTo])
            ->select(
                'departments.id as department_id',
                'departments.name as department_name',
                'leave_types.name as leave_type_name',
                DB::raw('COUNT(*) as total_requests'),
                DB::raw('SUM(CASE WHEN leaves.status = "approved" THEN 1 ELSE 0 END) as approved_requests'),
                DB::raw('SUM(CASE WHEN leaves.status = "approved" THEN leaves.total_days ELSE 0 END) as total_days')
            )
            ->groupBy('departments.id', 'departments.name', 'leave_types.name');

        if (!empty($filters['department_id'])) {
            $query->where('departments.id', $filters['department_id']);
        }

        $data = $query->get()->groupBy('department_name');

        return [
            'departments' => $data->map(function ($departmentData, $departmentName) {
                $totalRequests = $departmentData->sum('total_requests');
                $approvedRequests = $departmentData->sum('approved_requests');
                $totalDays = $departmentData->sum('total_days');

                return [
                    'name' => $departmentName,
                    'total_requests' => $totalRequests,
                    'approved_requests' => $approvedRequests,
                    'approval_rate' => $totalRequests > 0 ? round(($approvedRequests / $totalRequests) * 100, 2) : 0,
                    'total_days' => $totalDays,
                    'by_leave_type' => $departmentData->map(function ($item) {
                        return [
                            'leave_type' => $item->leave_type_name,
                            'requests' => $item->total_requests,
                            'days' => $item->total_days,
                        ];
                    })->values(),
                ];
            })->values(),
        ];
    }

    /**
     * Export report to Excel.
     */
    public function export(Request $request)
    {
        $request->validate([
            'report_type' => 'required|in:summary,detailed,balance,trends,department',
            'date_from' => 'required|date',
            'date_to' => 'required|date|after_or_equal:date_from',
            'format' => 'required|in:xlsx,csv,pdf',
        ]);

        try {
            $filters = $request->only([
                'date_from', 'date_to', 'employee_id', 'department_id',
                'leave_type_id', 'status', 'report_type'
            ]);

            $filename = 'leave_report_' . $request->report_type . '_' . date('Y-m-d_H-i-s') . '.' . $request->format;

            return Excel::download(
                new LeaveReportExport($filters),
                $filename
            );

        } catch (\Exception $e) {
            Log::error('Error exporting leave report: ' . $e->getMessage());

            return back()->with('error', 'Failed to export report. Please try again.');
        }
    }

    /**
     * Apply filters to query.
     */
    private function applyFilters($query, array $filters): void
    {
        if (!empty($filters['employee_id'])) {
            $query->where('employee_id', $filters['employee_id']);
        }

        if (!empty($filters['leave_type_id'])) {
            $query->where('leave_type_id', $filters['leave_type_id']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['department_id'])) {
            $query->whereHas('employee', function ($q) use ($filters) {
                $q->where('department_id', $filters['department_id']);
            });
        }
    }

    /**
     * Get monthly trend data.
     */
    private function getMonthlyTrend(string $dateFrom, string $dateTo, array $filters): array
    {
        $query = Leave::whereBetween('start_date', [$dateFrom, $dateTo]);
        $this->applyFilters($query, $filters);

        return $query->selectRaw('YEAR(start_date) as year, MONTH(start_date) as month, COUNT(*) as count, SUM(total_days) as total_days')
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get()
            ->map(function ($item) {
                return [
                    'period' => Carbon::create($item->year, $item->month)->format('M Y'),
                    'requests' => $item->count,
                    'days' => $item->total_days,
                ];
            })
            ->toArray();
    }

    /**
     * Get yearly comparison data.
     */
    private function getYearlyComparison(array $filters): array
    {
        $currentYear = now()->year;
        $previousYear = $currentYear - 1;

        $currentYearData = Leave::whereYear('start_date', $currentYear)
            ->selectRaw('COUNT(*) as requests, SUM(total_days) as days')
            ->first();

        $previousYearData = Leave::whereYear('start_date', $previousYear)
            ->selectRaw('COUNT(*) as requests, SUM(total_days) as days')
            ->first();

        return [
            'current_year' => [
                'year' => $currentYear,
                'requests' => $currentYearData->requests ?? 0,
                'days' => $currentYearData->days ?? 0,
            ],
            'previous_year' => [
                'year' => $previousYear,
                'requests' => $previousYearData->requests ?? 0,
                'days' => $previousYearData->days ?? 0,
            ],
        ];
    }

    /**
     * Get seasonal analysis data.
     */
    private function getSeasonalAnalysis(array $filters): array
    {
        $seasons = [
            'Spring' => [3, 4, 5],
            'Summer' => [6, 7, 8],
            'Autumn' => [9, 10, 11],
            'Winter' => [12, 1, 2],
        ];

        $data = [];
        foreach ($seasons as $season => $months) {
            $count = Leave::whereIn(DB::raw('MONTH(start_date)'), $months)
                ->whereYear('start_date', now()->year)
                ->count();

            $data[] = [
                'season' => $season,
                'requests' => $count,
            ];
        }

        return $data;
    }

    /**
     * Get peak periods data.
     */
    private function getPeakPeriods(array $filters): array
    {
        return Leave::selectRaw('MONTH(start_date) as month, COUNT(*) as count')
            ->whereYear('start_date', now()->year)
            ->groupBy('month')
            ->orderBy('count', 'desc')
            ->limit(3)
            ->get()
            ->map(function ($item) {
                return [
                    'month' => Carbon::create(null, $item->month)->format('F'),
                    'requests' => $item->count,
                ];
            })
            ->toArray();
    }

    /**
     * Get employee options for filters.
     */
    private function getEmployeeOptions(): array
    {
        return Employee::select('id', 'first_name', 'last_name', 'employee_id')
            ->orderBy('first_name')
            ->get()
            ->map(function ($employee) {
                return [
                    'value' => $employee->id,
                    'label' => $employee->full_name . ' (' . $employee->employee_id . ')',
                ];
            })
            ->toArray();
    }

    /**
     * Get department options for filters.
     */
    private function getDepartmentOptions(): array
    {
        return DB::table('departments')
            ->select('id', 'name')
            ->orderBy('name')
            ->get()
            ->map(function ($department) {
                return [
                    'value' => $department->id,
                    'label' => $department->name,
                ];
            })
            ->toArray();
    }

    /**
     * Get leave type options for filters.
     */
    private function getLeaveTypeOptions(): array
    {
        return LeaveType::select('id', 'name')
            ->where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(function ($leaveType) {
                return [
                    'value' => $leaveType->id,
                    'label' => $leaveType->name,
                ];
            })
            ->toArray();
    }
}
