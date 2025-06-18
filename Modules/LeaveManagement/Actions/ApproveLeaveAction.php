<?php

namespace Modules\LeaveManagement\Actions;

use Modules\LeaveManagement\Domain\Models\Leave;
use Modules\EmployeeManagement\Domain\Models\Employee;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class ApproveLeaveAction
{
    /**
     * Approve a leave request
     *
     * @param int $leaveId
     * @param array $data
     * @return Leave
     * @throws ValidationException|ModelNotFoundException
     */
    public function execute(int $leaveId, array $data = []): Leave
    {
        return DB::transaction(function () use ($leaveId, $data) {
            $leave = Leave::findOrFail($leaveId);

            // Only allow approval for pending leaves
            if ($leave->status !== 'pending') {
                throw ValidationException::withMessages([
                    'status' => 'Only pending leave requests can be approved.'
                ]);
            }

            // Check if approver has permission (basic check)
            $approver = Auth::user();
            if (!$approver) {
                throw ValidationException::withMessages([
                    'approver' => 'Authentication required for approval.'
                ]);
            }

            // Update leave status
            $leave->update([
                'status' => 'approved',
                'approved_by' => $approver->id,
                'approved_date' => Carbon::now(),
                'approval_comments' => $data['approval_comments'] ?? null
            ]);

            // Optional: Update employee leave balance if tracking
            $employee = $leave->employee;
            if ($employee && isset($employee->leave_balance)) {
                $newBalance = max(0, $employee->leave_balance - $leave->duration_days);
                $employee->update(['leave_balance' => $newBalance]);
            }

            return $leave->fresh();
        });
    }

    /**
     * Bulk approve multiple leave requests
     *
     * @param array $leaveIds
     * @param array $data
     * @return array
     */
    public function bulkApprove(array $leaveIds, array $data = []): array
    {
        $results = [];

        foreach ($leaveIds as $leaveId) {
            try {
                $results[$leaveId] = [
                    'success' => true,
                    'leave' => $this->execute($leaveId, $data)
                ];
            } catch (\Exception $e) {
                $results[$leaveId] = [
                    'success' => false,
                    'error' => $e->getMessage()
                ];
            }
        }

        return $results;
    }
}


