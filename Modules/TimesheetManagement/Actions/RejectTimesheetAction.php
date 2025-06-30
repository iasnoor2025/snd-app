<?php

namespace Modules\TimesheetManagement\Actions;

use Modules\TimesheetManagement\Domain\Models\WeeklyTimesheet;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class RejectTimesheetAction
{
    /**
     * Execute the action to reject a timesheet.
     *
     * @param int $timesheetId
     * @param string $rejectionReason
     * @return \Modules\TimesheetManagement\Domain\Models\WeeklyTimesheet;
     * @throws \Exception
     */
    public function execute(int $timesheetId, string $rejectionReason): WeeklyTimesheet
    {
        return DB::transaction(function () use ($timesheetId, $rejectionReason) {
            // Find the timesheet
            $timesheet = WeeklyTimesheet::findOrFail($timesheetId);

            // Check if the timesheet is in a state that can be rejected
            if ($timesheet->status !== 'submitted') {
                throw ValidationException::withMessages([
                    'status' => ['Only submitted timesheets can be rejected.']
                ]);
            }

            // Get current user
            $user = Auth::user();

            // Check if user has permission to reject
            if (!$user->can('timesheets.approve')) {
                throw ValidationException::withMessages([
                    'permission' => ['You do not have permission to reject timesheets.']
                ]);
            }

            // Check if user is the employee's manager (if configured to require manager approval)
            if (config('timesheetmanagement.approval.require_manager', true)) {
                $employee = $timesheet->employee;
                if ($employee && $employee->manager_id !== $user->id) {
                    // Check if user has override permission
                    if (!$user->can('override-timesheet-approval')) {
                        throw ValidationException::withMessages([
                            'permission' => ['Only the employee\'s manager can reject this timesheet.']
                        ]);
                    }
                }
            }

            // Check if rejection reason is provided
            if (empty($rejectionReason)) {
                throw ValidationException::withMessages([
                    'rejection_reason' => ['A reason for rejection is required.']
                ]);
            }

            // Update timesheet status and rejection details
            $timesheet->status = 'rejected';
            $timesheet->rejected_by = $user->id;
            $timesheet->rejected_at = Carbon::now();
            $timesheet->rejection_reason = $rejectionReason;

            // Clear any previous approval
            $timesheet->approved_by = null;
            $timesheet->approved_at = null;

            // Save the timesheet
            $timesheet->save();

            // Return the updated timesheet
            return $timesheet->fresh();
        });
    }
}


