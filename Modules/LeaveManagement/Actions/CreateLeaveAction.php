<?php

namespace Modules\LeaveManagement\Actions;

use Modules\LeaveManagement\Domain\Models\Leave;
use Modules\EmployeeManagement\Domain\Models\Employee;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CreateLeaveAction
{
    /**
     * Create a new leave request
     *
     * @param array $data
     * @return Leave
     * @throws ValidationException
     */
    public function execute(array $data): Leave
    {
        return DB::transaction(function () use ($data) {
            // Validate employee exists
            $employee = Employee::findOrFail($data['employee_id']);

            // Validate dates
            $startDate = Carbon::parse($data['start_date']);
            $endDate = Carbon::parse($data['end_date']);

            if ($startDate->gt($endDate)) {
                throw ValidationException::withMessages([
                    'end_date' => 'End date must be after start date.'
                ]);
            }

            // Calculate duration in days
            $duration = $startDate->diffInDays($endDate) + 1;

            // Check for overlapping leaves
            $overlapping = Leave::where('employee_id', $data['employee_id'])
                ->where('status', '!=', 'rejected')
                ->where(function ($query) use ($startDate, $endDate) {
                    $query->whereBetween('start_date', [$startDate, $endDate])
                          ->orWhereBetween('end_date', [$startDate, $endDate])
                          ->orWhere(function ($q) use ($startDate, $endDate) {
                              $q->where('start_date', '<=', $startDate)
                                ->where('end_date', '>=', $endDate);
                          });
                })
                ->exists();

            if ($overlapping) {
                throw ValidationException::withMessages([
                    'start_date' => 'Leave dates overlap with existing leave request.'
                ]);
            }

            // Create leave request
            $leave = Leave::create([
                'employee_id' => $data['employee_id'],
                'leave_type_id' => $data['leave_type_id'],
                'start_date' => $startDate,
                'end_date' => $endDate,
                'duration_days' => $duration,
                'reason' => $data['reason'] ?? null,
                'status' => 'pending',
                'applied_date' => Carbon::now(),
                'emergency_contact' => $data['emergency_contact'] ?? null,
                'handover_notes' => $data['handover_notes'] ?? null
            ]);

            return $leave;
        });
    }
}
