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
            $employeeData = $employee->load(['department', 'user'])->toArray();
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

            // Use AdvancePayment records only
            $advancePayments = \Modules\EmployeeManagement\Domain\Models\AdvancePayment::where('employee_id', $employee->id)
                ->orderBy('created_at', 'desc')
                ->get();
            $advances['data'] = $advancePayments->map(function ($advance) {
                $repayments = method_exists($advance, 'paymentHistories') ? $advance->paymentHistories()->get(['amount', 'payment_date', 'notes'])->toArray() : [];
                return [
                    'id' => $advance->id,
                    'amount' => $advance->amount,
                    'reason' => $advance->reason,
                    'status' => $advance->status,
                    'created_at' => $advance->created_at,
                    'rejection_reason' => $advance->rejection_reason,
                    'repayment_date' => $advance->repayment_date ?? null,
                    'type' => 'advance_payment',
                    'monthly_deduction' => $advance->monthly_deduction,
                    'repaid_amount' => $advance->repaid_amount ?? 0,
                    'remaining_balance' => $advance->remaining_balance ?? 0,
                    'repayments' => $repayments,
                ];
            })->toArray();

            // Calculate current balance from all advances
            $currentBalance = $advancePayments->sum(function ($advance) {
                return $advance->amount - $advance->repaid_amount;
            });

            // Calculate total repaid amount (simplified implementation)
            $totalRepaid = $advancePayments->filter(function ($advance) {
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

            // Get assignments (EmployeeAssignment + project manpower + rental assignments)
            $assignments = ['data' => []];
            $assignmentList = [];

            // 1. EmployeeAssignment records
            if (class_exists('Modules\\EmployeeManagement\\Domain\\Models\\EmployeeAssignment')) {
                $rawAssignments = EmployeeAssignment::withTrashed()->with(['project', 'rental', 'assignedBy'])
                    ->where('employee_id', $employee->id)
                    ->orderBy('created_at', 'desc')
                    ->get();
                \Log::info('Assignments before mapping', ['raw' => $rawAssignments->toArray()]);
                $assignmentList = $rawAssignments
                    ->map(function ($assignment) {
                        return [
                            'id' => $assignment->id,
                            'type' => $assignment->type,
                            'name' => $assignment->name,
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
                        ];
                    })->toArray();
                \Log::info('Assignments after mapping', ['mapped' => $assignmentList]);
            }

            // Remove duplicates by id + type (case-insensitive)
            $assignments['data'] = collect($assignmentList)
                ->unique(function ($item) {
                    return $item['id'] . '-' . strtolower($item['type'] ?? '');
                })
                ->sortByDesc('start_date')
                ->values()
                ->all();

            // Find the current assignment as the one with the latest start_date
            $currentAssignment = null;
            if (count($assignments['data']) > 0) {
                $currentAssignment = collect($assignments['data'])->reduce(function ($latest, $curr) {
                    if (!$latest) return $curr;
                    $latestDate = $latest['start_date'] ? strtotime($latest['start_date']) : 0;
                    $currDate = $curr['start_date'] ? strtotime($curr['start_date']) : 0;
                    return $currDate > $latestDate ? $curr : $latest;
                }, null);
            }
            $employeeData['current_assignment'] = $currentAssignment;

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
