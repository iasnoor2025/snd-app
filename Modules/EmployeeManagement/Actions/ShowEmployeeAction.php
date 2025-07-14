<?php

namespace Modules\EmployeeManagement\Actions;

use Modules\EmployeeManagement\Domain\Models\Employee;
use Modules\EmployeeManagement\Domain\Models\EmployeeAssignment;
use Modules\TimesheetManagement\Domain\Models\Timesheet;
use Modules\LeaveManagement\Domain\Models\LeaveRequest;
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
            // Add current_assignment to employee data for show page
            $employeeData['current_assignment'] = $employee->current_assignment;

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
                // Only real advances from the database are included below
                $allAdvances = \Modules\PayrollManagement\Domain\Models\AdvancePayment::where('employee_id', $employee->id)
                    ->orderBy('created_at', 'desc')
                    ->get();

                $advances = [
                    'data' => $allAdvances->map(function ($advance) {
                        return [
                            'id' => $advance->id,
                            'amount' => $advance->amount,
                            'reason' => $advance->reason,
                            'status' => $advance->status,
                            'created_at' => $advance->created_at,
                            'rejection_reason' => $advance->rejection_reason,
                            'repayment_date' => $advance->repayment_date,
                            'type' => 'advance_payment',
                            'monthly_deduction' => $advance->monthly_deduction,
                            'repaid_amount' => $advance->repaid_amount,
                            'remaining_balance' => $advance->remaining_balance,
                        ];
                    })->toArray()
                ];

                // Calculate current balance from all advances
                $currentBalance = $allAdvances->sum(function ($advance) {
                    return $advance->amount - $advance->repaid_amount;
                });

                // Calculate total repaid amount (simplified implementation)
                $totalRepaid = $allAdvances->filter(function ($advance) {
                    return isset($advance->type) && $advance->type === 'repayment';
                })->sum('amount');

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
            } else {
                $currentBalance = 0;
            }

            // Get assignments (EmployeeAssignment + project manpower + rental assignments)
            $assignments = ['data' => []];
            $assignmentList = [];

            // 1. EmployeeAssignment records
            if (class_exists('Modules\\EmployeeManagement\\Domain\\Models\\EmployeeAssignment')) {
                $assignmentList = array_merge($assignmentList, EmployeeAssignment::withTrashed()->with(['project', 'rental', 'assignedBy'])
                        ->where('employee_id', $employee->id)
                        ->orderBy('created_at', 'desc')
                        ->get()
                        ->map(function ($assignment) {
                            return [
                                'id' => $assignment->id,
                                'type' => $assignment->type,
                                'status' => $assignment->status,
                                'location' => $assignment->location,
                                'location_name' => $assignment->location_name,
                                'start_date' => $assignment->start_date ? $assignment->start_date->toDateString() : null,
                                'end_date' => $assignment->end_date ? $assignment->end_date->toDateString() : null,
                                'notes' => $assignment->notes,
                                'assigned_by' => $assignment->assignedBy ? [
                                    'id' => $assignment->assignedBy->id,
                                    'name' => $assignment->assignedBy->name,
                                ] : null,
                                'project_id' => $assignment->project_id,
                                'rental_id' => $assignment->rental_id,
                                'deleted_at' => $assignment->deleted_at,
                                'title' => $assignment->project ? $assignment->project->name : ($assignment->rental ? $assignment->rental->project_name : ucfirst($assignment->type)),
                                'description' => $assignment->notes ?? ($assignment->project ? $assignment->project->description : ($assignment->rental ? $assignment->rental->description : '')),
                                'project' => $assignment->project ? [
                                    'id' => $assignment->project->id,
                                    'name' => $assignment->project->name,
                                ] : null,
                                'rental' => $assignment->rental ? [
                                    'id' => $assignment->rental->id,
                                    'project_name' => $assignment->rental->project_name,
                                'rental_number' => $assignment->rental->rental_number ?? null,
                                ] : null,
                            'rental_number' => $assignment->rental ? $assignment->rental->rental_number ?? null : null,
                                'assigned_by' => $assignment->assignedBy ? [
                                    'id' => $assignment->assignedBy->id,
                                    'name' => $assignment->assignedBy->name,
                                ] : null,
                            ];
                    })->toArray());
            }

            // 2. Project manpower assignments
            if (method_exists($employee, 'projectManpower')) {
                $assignmentList = array_merge($assignmentList, $employee->projectManpower()
                    ->with(['project:id,name'])
                    ->where(function($query) {
                        $query->whereNull('end_date')
                            ->orWhere('end_date', '>=', now()->toDateString());
                    })
                    ->orderBy('start_date', 'desc')
                    ->get()
                    ->map(function ($pm) {
                        return [
                            'id' => $pm->id,
                            'type' => 'project',
                            'status' => 'active',
                            'location' => 'Project Location',
                            'location_name' => null,
                            'start_date' => $pm->start_date ? $pm->start_date->toDateString() : null,
                            'end_date' => $pm->end_date ? $pm->end_date->toDateString() : null,
                            'notes' => $pm->notes ?? null,
                            'assigned_by_id' => null,
                            'project_id' => $pm->project_id,
                            'rental_id' => null,
                            'deleted_at' => null,
                            'title' => $pm->project ? $pm->project->name : 'Project',
                            'description' => $pm->job_title ?? '',
                            'project' => $pm->project ? [
                                'id' => $pm->project->id,
                                'name' => $pm->project->name,
                            ] : null,
                            'rental' => null,
                            'rental_number' => null,
                            'assigned_by' => null,
                        ];
                    })->toArray());
            }

            // 3. Rental assignments
            if (method_exists($employee, 'rentalAssignments')) {
                $assignmentList = array_merge($assignmentList, $employee->rentalAssignments()
                    ->with(['rental:id,customer_id,location_id,rental_number', 'rental.customer:id,name', 'rental.location:id,name'])
                    // Remove ->where('status', 'active') to include all statuses
                    ->orderBy('assignment_date', 'desc')
                    ->get()
                    ->map(function ($ra) {
                        return [
                            'id' => $ra->id,
                            'type' => 'rental',
                            'status' => $ra->status,
                            'location' => $ra->rental && $ra->rental->location ? $ra->rental->location->name : 'Unknown Location',
                            'location_name' => null,
                            'start_date' => $ra->assignment_date ? $ra->assignment_date->toDateString() : null,
                            'end_date' => $ra->end_date ? $ra->end_date->toDateString() : null,
                            'notes' => $ra->notes,
                            'assigned_by_id' => $ra->assigned_by_id,
                            'project_id' => null,
                            'rental_id' => $ra->rental_id,
                            'deleted_at' => $ra->deleted_at,
                            'title' => $ra->rental && $ra->rental->customer ? $ra->rental->customer->name : 'Rental',
                            'description' => $ra->notes ?? '',
                            'project' => null,
                            'rental' => $ra->rental ? [
                                'id' => $ra->rental->id,
                                'project_name' => $ra->rental->customer->name ?? '',
                                'rental_number' => $ra->rental->rental_number ?? null,
                            ] : null,
                            'rental_number' => $ra->rental ? $ra->rental->rental_number ?? null : null,
                            'assigned_by' => $ra->assignedBy ? [
                                'id' => $ra->assignedBy->id,
                                'name' => $ra->assignedBy->name,
                            ] : null,
                ];
                    })->toArray());
            }

            // 4. Rental items where employee is operator
            if (method_exists($employee, 'rentalItems')) {
                $assignmentList = array_merge($assignmentList, $employee->rentalItems()
                    ->with(['rental:id,customer_id,location_id,rental_number', 'rental.customer:id,name', 'rental.location:id,name', 'equipment:id,name'])
                    ->orderBy('start_date', 'desc')
                    ->get()
                    ->map(function ($ri) {
                        $startDate = $ri->start_date;
                        if ($startDate instanceof \DateTimeInterface) {
                            $startDate = $startDate->toDateString();
                        }
                        $endDate = $ri->end_date;
                        if ($endDate instanceof \DateTimeInterface) {
                            $endDate = $endDate->toDateString();
                        }
                        return [
                            'id' => $ri->id,
                            'type' => 'rental_item',
                            'status' => $ri->rental && $ri->rental->status ? $ri->rental->status : 'unknown',
                            'location' => $ri->rental && $ri->rental->location ? $ri->rental->location->name : 'Unknown Location',
                            'location_name' => null,
                            'start_date' => $startDate,
                            'end_date' => $endDate,
                            'notes' => $ri->notes,
                            'assigned_by_id' => null,
                            'project_id' => null,
                            'rental_id' => $ri->rental_id,
                            'deleted_at' => $ri->deleted_at,
                            'title' => $ri->rental && $ri->rental->customer ? $ri->rental->customer->name : 'Rental',
                            'description' => $ri->notes ?? '',
                            'project' => null,
                            'rental' => $ri->rental ? [
                                'id' => $ri->rental->id,
                                'project_name' => $ri->rental->customer->name ?? '',
                                'rental_number' => $ri->rental->rental_number ?? null,
                            ] : null,
                            'rental_number' => $ri->rental ? $ri->rental->rental_number ?? null : null,
                            'assigned_by' => null,
                            'equipment' => $ri->equipment ? $ri->equipment->name : null,
                        ];
                    })->toArray());
            }

            // Remove duplicates by id + type
            $assignments['data'] = collect($assignmentList)
                ->unique(function ($item) {
                    return $item['id'] . '-' . $item['type'];
                })
                ->sortByDesc('start_date')
                ->values()
                ->all();

            // Find the current assignment from the assignments list by matching type and id
            $currentAssignment = null;
            if (!empty($assignments['data'])) {
                $current = $employee->current_assignment;
                if ($current && isset($current['type'], $current['id'])) {
                    $currentAssignment = collect($assignments['data'])->first(function ($a) use ($current) {
                        return $a['type'] === $current['type'] && $a['project_id'] == $current['id'];
                    });
                }
            }
            $employeeData['current_assignment'] = $currentAssignment ?: $employee->current_assignment;

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
                'current_balance' => $currentBalance,
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
