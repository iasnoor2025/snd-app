<?php

namespace Modules\LeaveManagement\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Modules\LeaveManagement\Domain\Leave\Models\Leave;
use Modules\LeaveManagement\Domain\Leave\Models\LeaveType;
use Modules\EmployeeManagement\Domain\Employee\Models\Employee;
use Illuminate\Support\Collection;

class LeaveReportExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithTitle
{
    protected array $filters;
    protected string $reportType;

    public function __construct(array $filters)
    {
        $this->filters = $filters;
        $this->reportType = $filters['report_type'] ?? 'summary';
    }

    /**
     * @return Collection
     */
    public function collection()
    {
        switch ($this->reportType) {
            case 'detailed':
                return $this->getDetailedData();
            case 'balance':
                return $this->getBalanceData();
            case 'department':
                return $this->getDepartmentData();
            case 'summary':
            default:
                return $this->getSummaryData();
        }
    }

    /**
     * @return array
     */
    public function headings(): array
    {
        switch ($this->reportType) {
            case 'detailed':
                return [
                    'Employee ID',
                    'Employee Name',
                    'Department',
                    'Leave Type',
                    'Start Date',
                    'End Date',
                    'Total Days',
                    'Status',
                    'Reason',
                    'Applied Date',
                    'Approved Date',
                    'Approver',
                ];
            case 'balance':
                return [
                    'Employee ID',
                    'Employee Name',
                    'Department',
                    'Leave Type',
                    'Allocated Days',
                    'Used Days',
                    'Remaining Days',
                    'Carried Forward',
                ];
            case 'department':
                return [
                    'Department',
                    'Total Requests',
                    'Approved Requests',
                    'Approval Rate (%)',
                    'Total Days',
                ];
            case 'summary':
            default:
                return [
                    'Leave Type',
                    'Total Requests',
                    'Approved Requests',
                    'Pending Requests',
                    'Rejected Requests',
                    'Total Days',
                ];
        }
    }

    /**
     * @param mixed $row
     * @return array
     */
    public function map($row): array
    {
        switch ($this->reportType) {
            case 'detailed':
                return [
                    $row->employee->employee_id,
                    $row->employee->full_name,
                    $row->employee->department->name ?? 'N/A',
                    $row->leaveType->name,
                    $row->start_date->format('Y-m-d'),
                    $row->end_date->format('Y-m-d'),
                    $row->total_days,
                    ucfirst($row->status),
                    $row->reason,
                    $row->created_at->format('Y-m-d H:i'),
                    $row->approved_at?->format('Y-m-d H:i') ?? 'N/A',
                    $row->approver?->full_name ?? 'N/A',
                ];
            case 'balance':
                return [
                    $row['employee_id'],
                    $row['employee_name'],
                    $row['department'],
                    $row['leave_type'],
                    $row['allocated'],
                    $row['used'],
                    $row['remaining'],
                    $row['carried_forward'],
                ];
            case 'department':
                return [
                    $row['department_name'],
                    $row['total_requests'],
                    $row['approved_requests'],
                    $row['approval_rate'],
                    $row['total_days'],
                ];
            case 'summary':
            default:
                return [
                    $row['leave_type'],
                    $row['total_requests'],
                    $row['approved_requests'],
                    $row['pending_requests'],
                    $row['rejected_requests'],
                    $row['total_days'],
                ];
        }
    }

    /**
     * @param Worksheet $sheet
     * @return array
     */
    public function styles(Worksheet $sheet)
    {
        return [
            // Style the first row as bold text.
            1 => ['font' => ['bold' => true]],
        ];
    }

    /**
     * @return string
     */
    public function title(): string
    {
        return ucfirst($this->reportType) . ' Report';
    }

    /**
     * Get summary data for export.
     */
    private function getSummaryData(): Collection
    {
        $dateFrom = $this->filters['date_from'] ?? now()->startOfMonth()->format('Y-m-d');
        $dateTo = $this->filters['date_to'] ?? now()->endOfMonth()->format('Y-m-d');

        $query = Leave::with(['employee', 'leaveType'])
            ->whereBetween('start_date', [$dateFrom, $dateTo]);

        $this->applyFilters($query);

        $leaves = $query->get();

        $summary = $leaves->groupBy('leave_type_id')->map(function ($group) {
            $leaveType = $group->first()->leaveType;
            return [
                'leave_type' => $leaveType->name,
                'total_requests' => $group->count(),
                'approved_requests' => $group->where('status', 'approved')->count(),
                'pending_requests' => $group->where('status', 'pending')->count(),
                'rejected_requests' => $group->where('status', 'rejected')->count(),
                'total_days' => $group->where('status', 'approved')->sum('total_days'),
            ];
        });

        return collect($summary->values());
    }

    /**
     * Get detailed data for export.
     */
    private function getDetailedData(): Collection
    {
        $dateFrom = $this->filters['date_from'] ?? now()->startOfMonth()->format('Y-m-d');
        $dateTo = $this->filters['date_to'] ?? now()->endOfMonth()->format('Y-m-d');

        $query = Leave::with(['employee.department', 'leaveType', 'approver', 'rejector'])
            ->whereBetween('start_date', [$dateFrom, $dateTo]);

        $this->applyFilters($query);

        return $query->orderBy('created_at', 'desc')->get()->map(function ($leave) {
            return [
                'employee_id' => $leave->employee->employee_id,
                'employee_name' => $leave->employee->full_name,
                'department' => $leave->employee->department->name ?? 'N/A',
                'leave_type' => $leave->leaveType->name,
                'start_date' => ($leave->start_date instanceof \Carbon\Carbon ? $leave->start_date : \Carbon\Carbon::parse($leave->start_date))->format('Y-m-d'),
                'end_date' => ($leave->end_date instanceof \Carbon\Carbon ? $leave->end_date : \Carbon\Carbon::parse($leave->end_date))->format('Y-m-d'),
                'total_days' => $leave->total_days,
                'status' => ucfirst($leave->status),
                'reason' => $leave->reason,
                'created_at' => $leave->created_at->format('Y-m-d H:i'),
                'approved_at' => $leave->approved_at?->format('Y-m-d H:i') ?? 'N/A',
                'approver' => $leave->approver?->full_name ?? 'N/A',
            ];
        });
    }

    /**
     * Get balance data for export.
     */
    private function getBalanceData(): Collection
    {
        $query = Employee::with(['department', 'leaveBalances.leaveType'])
            ->whereHas('leaveBalances');

        if (!empty($this->filters['department_id'])) {
            $query->where('department_id', $this->filters['department_id']);
        }

        if (!empty($this->filters['employee_id'])) {
            $query->where('id', $this->filters['employee_id']);
        }

        $employees = $query->get();

        $balanceData = collect();

        foreach ($employees as $employee) {
            foreach ($employee->leaveBalances as $balance) {
                $balanceData->push([
                    'employee_id' => $employee->employee_id,
                    'employee_name' => $employee->full_name,
                    'department' => $employee->department->name ?? 'N/A',
                    'leave_type' => $balance->leaveType->name,
                    'allocated' => $balance->allocated_days,
                    'used' => $balance->used_days,
                    'remaining' => $balance->remaining_days,
                    'carried_forward' => $balance->carried_forward_days,
                ]);
            }
        }

        return $balanceData;
    }

    /**
     * Get department data for export.
     */
    private function getDepartmentData(): Collection
    {
        $dateFrom = $this->filters['date_from'] ?? now()->startOfMonth()->format('Y-m-d');
        $dateTo = $this->filters['date_to'] ?? now()->endOfMonth()->format('Y-m-d');

        $query = \DB::table('leaves')
            ->join('employees', 'leaves.employee_id', '=', 'employees.id')
            ->join('departments', 'employees.department_id', '=', 'departments.id')
            ->whereBetween('leaves.start_date', [$dateFrom, $dateTo])
            ->select(
                'departments.name as department_name',
                \DB::raw('COUNT(*) as total_requests'),
                \DB::raw('SUM(CASE WHEN leaves.status = "approved" THEN 1 ELSE 0 END) as approved_requests'),
                \DB::raw('SUM(CASE WHEN leaves.status = "approved" THEN leaves.total_days ELSE 0 END) as total_days')
            )
            ->groupBy('departments.name');

        if (!empty($this->filters['department_id'])) {
            $query->where('departments.id', $this->filters['department_id']);
        }

        $data = $query->get()->map(function ($item) {
            $approvalRate = $item->total_requests > 0
                ? round(($item->approved_requests / $item->total_requests) * 100, 2)
                : 0;

            return [
                'department_name' => $item->department_name,
                'total_requests' => $item->total_requests,
                'approved_requests' => $item->approved_requests,
                'approval_rate' => $approvalRate,
                'total_days' => $item->total_days,
            ];
        });

        return collect($data);
    }

    /**
     * Apply filters to query.
     */
    private function applyFilters($query): void
    {
        if (!empty($this->filters['employee_id'])) {
            $query->where('employee_id', $this->filters['employee_id']);
        }

        if (!empty($this->filters['leave_type_id'])) {
            $query->where('leave_type_id', $this->filters['leave_type_id']);
        }

        if (!empty($this->filters['status'])) {
            $query->where('status', $this->filters['status']);
        }

        if (!empty($this->filters['department_id'])) {
            $query->whereHas('employee', function ($q) {
                $q->where('department_id', $this->filters['department_id']);
            });
        }
    }
}
