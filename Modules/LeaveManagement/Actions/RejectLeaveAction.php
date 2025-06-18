<?php

namespace Modules\LeaveManagement\Actions;

use Modules\LeaveManagement\Domain\Models\Leave;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class RejectLeaveAction
{
    /**
     * Reject a leave request
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

            // Only allow rejection for pending leaves
            if ($leave->status !== 'pending') {
                throw ValidationException::withMessages([
                    'status' => 'Only pending leave requests can be rejected.'
                ]);
            }

            // Check if rejector has permission (basic check)
            $rejector = Auth::user();
            if (!$rejector) {
                throw ValidationException::withMessages([
                    'rejector' => 'Authentication required for rejection.'
                ]);
            }

            // Rejection reason is typically required
            if (empty($data['rejection_reason'])) {
                throw ValidationException::withMessages([
                    'rejection_reason' => 'Rejection reason is required.'
                ]);
            }

            // Update leave status
            $leave->update([
                'status' => 'rejected',
                'rejected_by' => $rejector->id,
                'rejected_date' => Carbon::now(),
                'rejection_reason' => $data['rejection_reason'],
                'rejection_comments' => $data['rejection_comments'] ?? null
            ]);

            return $leave->fresh();
        });
    }

    /**
     * Bulk reject multiple leave requests
     *
     * @param array $leaveIds
     * @param array $data
     * @return array
     */
    public function bulkReject(array $leaveIds, array $data = []): array
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
