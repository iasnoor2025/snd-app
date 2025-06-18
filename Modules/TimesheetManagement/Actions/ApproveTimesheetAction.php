<?php

namespace Modules\TimesheetManagement\Actions;

use Modules\TimesheetManagement\Domain\Models\WeeklyTimesheet;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class ApproveTimesheetAction
{
    /**
     * Execute the action to approve a timesheet.
     *
     * @param int $timesheetId
     * @param string|null $notes
     * @return \Modules\TimesheetManagement\Domain\Models\WeeklyTimesheet;
     * @throws \Exception
     */
    public function execute(int $timesheetId, ?string $notes = null): WeeklyTimesheet
    {
        return DB::transaction(function () use ($timesheetId, $notes) {
            // Find the timesheet
            $timesheet = WeeklyTimesheet::findOrFail($timesheetId);

            // Check if the timesheet is in a state that can be approved
            if ($timesheet->status !== 'submitted') {
                throw ValidationException::withMessages([
                    'status' => ['Only submitted timesheets can be approved.']
                ]);
            }

            // Get current user
            $user = Auth::user();

            // Check if user has permission to approve
            if (!$user->can('approve-timesheets')) {
                throw ValidationException::withMessages([
                    'permission' => ['You do not have permission to approve timesheets.']
                ]);
            }

            // Check if user is the employee's manager (if configured to require manager approval)
            if (config('timesheetmanagement.approval.require_manager', true)) {
                $employee = $timesheet->employee;
                if ($employee && $employee->manager_id !== $user->id) {
                    // Check if user has override permission
                    if (!$user->can('override-timesheet-approval')) {
                        throw ValidationException::withMessages([
                            'permission' => ['Only the employee\'s manager can approve this timesheet.']
                        ]);
                    }
                }
            }

            // Update timesheet status and approval details
            $timesheet->status = 'approved';
            $timesheet->approved_by = $user->id;
            $timesheet->approved_at = Carbon::now();

            // Clear any previous rejection
            $timesheet->rejected_by = null;
            $timesheet->rejected_at = null;
            $timesheet->rejection_reason = null;

            // Update notes if provided
            if ($notes) {
                $timesheet->notes = $notes;
            }

            // Save the timesheet
            $timesheet->save();

            // Return the updated timesheet
            return $timesheet->fresh();
        });
    }
}


