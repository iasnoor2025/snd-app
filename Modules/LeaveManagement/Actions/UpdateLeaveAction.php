<?php

namespace Modules\LeaveManagement\Actions;

use Modules\LeaveManagement\Domain\Models\Leave;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class UpdateLeaveAction
{
    /**
     * Update an existing leave request
     *
     * @param int $leaveId
     * @param array $data
     * @return Leave
     * @throws ValidationException|ModelNotFoundException
     */
    public function execute(int $leaveId, array $data): Leave
    {
        return DB::transaction(function () use ($leaveId, $data) {
            $leave = Leave::findOrFail($leaveId);

            // Only allow updates for pending leaves
            if ($leave->status !== 'pending') {
                throw ValidationException::withMessages([
                    'status' => 'Only pending leave requests can be updated.'
                ]);
            }

            // Validate dates if provided
            if (isset($data['start_date']) || isset($data['end_date'])) {
                $startDate = Carbon::parse($data['start_date'] ?? $leave->start_date);
                $endDate = Carbon::parse($data['end_date'] ?? $leave->end_date);

                if ($startDate->gt($endDate)) {
                    throw ValidationException::withMessages([
                        'end_date' => 'End date must be after start date.'
                    ]);
                }

                // Check for overlapping leaves (excluding current leave)
                $overlapping = Leave::where('employee_id', $leave->employee_id)
                    ->where('id', '!=', $leaveId)
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

                // Update duration if dates changed
                $data['duration_days'] = $startDate->diffInDays($endDate) + 1;
                $data['start_date'] = $startDate instanceof \Carbon\Carbon ? $startDate : \Carbon\Carbon::parse($startDate);
                $data['end_date'] = $endDate instanceof \Carbon\Carbon ? $endDate : \Carbon\Carbon::parse($endDate);
            }

            // Update allowed fields
            $allowedFields = [
                'leave_type_id', 'start_date', 'end_date', 'duration_days',
                'reason', 'emergency_contact', 'handover_notes'
            ];

            $updateData = array_intersect_key($data, array_flip($allowedFields));
            $leave->update($updateData);

            return $leave->fresh();
        });
    }
}
