<?php

namespace Modules\TimesheetManagement\Actions;

use Modules\TimesheetManagement\Domain\Models\WeeklyTimesheet;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class SubmitTimesheetAction
{
    /**
     * Execute the action to submit a timesheet.
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

            // Check if timesheet belongs to the current user's employee record
            $user = Auth::user();
            if ($user->employee && $user->employee->id !== $timesheet->employee_id) {
                throw ValidationException::withMessages([
                    'timesheet_id' => ['You can only submit your own timesheets.']
                ]);
            }

            // Check if the timesheet is already submitted, approved or rejected
            if ($timesheet->status !== 'draft') {
                throw ValidationException::withMessages([
                    'status' => ['This timesheet has already been ' . $timesheet->status . '.']
                ]);
            }

            // Calculate timesheet hours
            $timesheet->calculateTotalHours();

            // Check if there are any time entries
            if ($timesheet->timeEntries()->count() === 0) {
                throw ValidationException::withMessages([
                    'timesheet_id' => ['Cannot submit an empty timesheet. Please add time entries first.']
                ]);
            }

            // Check if minimum required hours are met
            $minRequiredHours = 0;
            $workDays = config('timesheetmanagement.work_days', [1, 2, 3, 4, 5]);
            $defaultHours = config('timesheetmanagement.default_working_hours', 8);

            $startDate = Carbon::parse($timesheet->week_start_date);
            $endDate = Carbon::parse($timesheet->week_end_date);

            for ($date = $startDate; $date->lte($endDate); $date->addDay()) {
                if (in_array($date->dayOfWeek, $workDays)) {
                    $minRequiredHours += $defaultHours;
                }
            }

            // Allow some flexibility - they need at least 75% of min hours
            $minRequiredHours = $minRequiredHours * 0.75;

            if ($timesheet->total_hours < $minRequiredHours) {
                throw ValidationException::withMessages([
                    'timesheet_id' => ['Insufficient hours submitted. Expected at least ' . round($minRequiredHours, 1) . ' hours.']
                ]);
            }

            // Update timesheet status and submitted time
            $timesheet->status = 'submitted';
            $timesheet->submitted_at = Carbon::now();

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


