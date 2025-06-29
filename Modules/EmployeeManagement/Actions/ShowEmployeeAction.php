<?php

namespace Modules\EmployeeManagement\Actions;

use Modules\EmployeeManagement\Domain\Models\Employee;
use Modules\EmployeeManagement\Domain\Models\EmployeeAssignment;
use Modules\TimesheetManagement\Domain\Models\Timesheet;
use Modules\LeaveManagement\Domain\Models\LeaveRequest;
use Modules\PayrollManagement\Domain\Models\AdvancePayment;
use Modules\EmployeeManagement\Domain\Models\FinalSettlement;
use Illuminate\Support\Facades\Log;

class ShowEmployeeAction
{
    /**
     * Execute the action to show employee details.
     *
     * @param Employee $employee
     * @param string|null $month
     * @return array
     */
    public function execute(Employee $employee, $month = null): array
    {
        try {
            Log::info('Showing employee details', ['employee_id' => $employee->id]);

            // Set default month if not provided
            if (!$month) {
                $month = now()->format('Y-m');
            }

            // Employee details
            $employeeData = $employee->load(['position', 'department', 'user'])->toArray();

            // Get timesheets
            $timesheets = ['data' => []];
            if (class_exists('Modules\TimesheetManagement\Domain\Models\Timesheet')) {
                $timesheets = [
                    'data' => Timesheet::where('employee_id', $employee->id)
                        ->where('date', 'like', $month . '%')
                        ->orderBy('date', 'desc')
                        ->get()
                        ->toArray()
                ];
            }

            // Get leave requests
            $leaveRequests = ['data' => []];
            if (class_exists('Modules\LeaveManagement\Domain\Models\LeaveRequest')) {
                $leaveRequests = [
                    'data' => LeaveRequest::where('employee_id', $employee->id)
                        ->orderBy('created_at', 'desc')
                        ->get()
                        ->toArray()
                ];
            }

            // Get advances
            $advances = ['data' => []];
            $monthlyHistory = [];
            $totalRepaid = 0;
            $pagination = [];

            if (class_exists('Modules\PayrollManagement\Domain\Models\AdvancePayment')) {
                $advances = [
                    'data' => AdvancePayment::where('employee_id', $employee->id)
                        ->orderBy('created_at', 'desc')
                        ->get()
                        ->toArray()
                ];

                // Calculate total repaid amount (simplified implementation)
                $totalRepaid = AdvancePayment::where('employee_id', $employee->id)
                    ->where('type', 'repayment')
                    ->sum('amount');

                // Sample monthly history for now (you can replace with actual logic)
                $monthlyHistory = [
                    'data' => [],
                    'meta' => [
                        'current_page' => 1,
                        'last_page' => 1,
                        'per_page' => 10,
                        'total' => 0
                    ]
                ];

                $pagination = [
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => 10,
                    'total' => 0
                ];
            }

            // Get assignments
            $assignments = ['data' => []];
            if (class_exists('Modules\EmployeeManagement\Domain\Models\EmployeeAssignment')) {
                $assignments = [
                    'data' => EmployeeAssignment::where('employee_id', $employee->id)
                        ->orderBy('created_at', 'desc')
                        ->get()
                        ->toArray()
                ];
            }

            // Get final settlements
            $finalSettlements = ['data' => []];
            if (class_exists('Modules\EmployeeManagement\Domain\Models\FinalSettlement')) {
                $finalSettlements = [
                    'data' => FinalSettlement::where('employee_id', $employee->id)
                        ->orderBy('created_at', 'desc')
                        ->get()
                        ->toArray()
                ];
            }

            // Return all data needed by the Show component
            return [
                'employee' => $employeeData,
                'timesheets' => $timesheets,
                'leaveRequests' => $leaveRequests,
                'advances' => $advances,
                'assignments' => $assignments,
                'finalSettlements' => $finalSettlements,
                'monthlyHistory' => $monthlyHistory,
                'totalRepaid' => $totalRepaid,
                'pagination' => $pagination,
            ];

        } catch (\Exception $e) {
            Log::error('Error in ShowEmployeeAction', [
                'employee_id' => $employee->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // Return at least the employee data if there's an error
            return [
                'employee' => $employee->toArray(),
                'timesheets' => ['data' => []],
                'leaveRequests' => ['data' => []],
                'advances' => ['data' => []],
                'assignments' => ['data' => []],
                'finalSettlements' => ['data' => []],
                'monthlyHistory' => [],
                'totalRepaid' => 0,
                'pagination' => []
            ];
        }
    }
}
