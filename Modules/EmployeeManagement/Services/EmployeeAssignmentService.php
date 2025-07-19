<?php

namespace Modules\EmployeeManagement\Services;

use Modules\EmployeeManagement\Domain\Models\EmployeeAssignment;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class EmployeeAssignmentService
{
    /**
     * Manually manage assignment statuses for an employee
     */
    public function manageAssignmentStatuses(int $employeeId): void
    {
        Log::info('Managing assignment statuses for employee', ['employee_id' => $employeeId]);

        // Get all assignments for this employee, ordered by start date and ID
        $allAssignments = EmployeeAssignment::where('employee_id', $employeeId)
            ->orderBy('start_date', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        if ($allAssignments->isEmpty()) {
            Log::info('No assignments found for employee', ['employee_id' => $employeeId]);
            return;
        }

        // Find the current/latest assignment (the one with the latest start date)
        $currentAssignment = $allAssignments->sortByDesc('start_date')->first();

        Log::info('Assignment status management', [
            'total_assignments' => $allAssignments->count(),
            'current_assignment_id' => $currentAssignment ? $currentAssignment->id : null,
        ]);

        // Update all assignments based on their position
        foreach ($allAssignments as $assignment) {
            $isCurrent = $assignment->id === $currentAssignment->id;

            if ($isCurrent) {
                // Current assignment should be active and have no end date
                if ($assignment->status !== 'active' || $assignment->end_date !== null) {
                    Log::info('Updating current assignment status', [
                        'assignment_id' => $assignment->id,
                        'old_status' => $assignment->status,
                        'new_status' => 'active'
                    ]);

                    DB::table('employee_assignments')
                        ->where('id', $assignment->id)
                        ->update([
                            'status' => 'active',
                            'end_date' => null
                        ]);
                }
            } else {
                // Previous assignments should be completed and have an end date
                if ($assignment->status !== 'completed' || $assignment->end_date === null) {
                    // Set end date to the day before the current assignment starts
                    $endDate = $currentAssignment->start_date->copy()->subDay()->format('Y-m-d');

                    Log::info('Updating previous assignment status', [
                        'assignment_id' => $assignment->id,
                        'old_status' => $assignment->status,
                        'new_status' => 'completed',
                        'end_date' => $endDate
                    ]);

                    DB::table('employee_assignments')
                        ->where('id', $assignment->id)
                        ->update([
                            'status' => 'completed',
                            'end_date' => $endDate
                        ]);
                }
            }
        }

        Log::info('Assignment status management completed', ['employee_id' => $employeeId]);
    }

    /**
     * Get the current active assignment for an employee
     */
    public function getCurrentAssignment(int $employeeId): ?EmployeeAssignment
    {
        return EmployeeAssignment::where('employee_id', $employeeId)
            ->where('status', 'active')
            ->whereNull('end_date')
            ->first();
    }

    /**
     * Get all assignments for an employee with proper status
     */
    public function getEmployeeAssignments(int $employeeId): \Illuminate\Database\Eloquent\Collection
    {
        return EmployeeAssignment::where('employee_id', $employeeId)
            ->orderBy('start_date', 'desc')
            ->orderBy('id', 'desc')
            ->get();
    }
}
