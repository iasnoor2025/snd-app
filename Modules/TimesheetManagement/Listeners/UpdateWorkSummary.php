<?php

namespace Modules\TimesheetManagement\Listeners;

use Modules\TimesheetManagement\Events\TimesheetApproved;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Modules\Employee\Domain\Models\EmployeeWorkSummary;
use Illuminate\Support\Facades\DB;

class UpdateWorkSummary implements ShouldQueue
{
    use InteractsWithQueue;
    /**
     * The number of times the job may be attempted.
     *
     * @var int
     */
    public $tries = 3;

    /**
     * Create the event listener.
     *
     * @return void;
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     *
     * @param  TimesheetApproved  $event
     * @return void;
     */
    public function handle(TimesheetApproved $event)
    {
        $timesheet = $event->timesheet;
        $employeeId = $timesheet->employee_id;

        // Skip if no employee is associated
        if (!$employeeId) {
            return;
        }

        // Update employee's work summary (monthly aggregation)
        $yearMonth = $timesheet->week_start_date->format('Y-m');

        try {
            DB::transaction(function () use ($timesheet, $employeeId, $yearMonth) {
                // Find or create work summary for this month
                $workSummary = EmployeeWorkSummary::firstOrNew([
                    'employee_id' => $employeeId,
                    'year_month' => $yearMonth,
                ]);

                // Initialize if new
                if (!$workSummary->exists) {
                    $workSummary->regular_hours = 0;
                    $workSummary->overtime_hours = 0;
                    $workSummary->total_hours = 0;
                    $workSummary->projects_count = 0;
                    $workSummary->billable_hours = 0;
                    $workSummary->non_billable_hours = 0;
                }

                // Calculate which portion of the timesheet falls in this month
                $monthStart = \Carbon\Carbon::parse($yearMonth . '-01');
                $monthEnd = $monthStart->copy()->endOfMonth();

                // Get time entries within this month
                $timeEntries = $timesheet->timeEntries()
                    ->whereBetween('date', [$monthStart->toDateString(), $monthEnd->toDateString()])
                    ->get();

                // Calculate hours
                $regularHours = $timeEntries->where('is_overtime', false)->sum('hours');
                $overtimeHours = $timeEntries->where('is_overtime', true)->sum('hours');
                $billableHours = $timeEntries->where('is_billable', true)->sum('hours');
                $nonBillableHours = $timeEntries->where('is_billable', false)->sum('hours');

                // Calculate unique projects
                $uniqueProjects = $timeEntries->pluck('project_id')->filter()->unique()->count();

                // Update summary with this timesheet's data
                $workSummary->regular_hours += $regularHours;
                $workSummary->overtime_hours += $overtimeHours;
                $workSummary->total_hours += ($regularHours + $overtimeHours);
                $workSummary->billable_hours += $billableHours;
                $workSummary->non_billable_hours += $nonBillableHours;

                // Only update projects count if it's greater than current
                if ($uniqueProjects > $workSummary->projects_count) {
                    $workSummary->projects_count = $uniqueProjects;
                }

                // Set updated_at to now
                $workSummary->touch();

                // Save work summary
                $workSummary->save();
            });
        } catch (\Exception $e) {
            // Log error but don't fail the whole process
            \Log::error('Failed to update work summary: ' . $e->getMessage(), [
                'timesheet_id' => $timesheet->id,
                'employee_id' => $employeeId,
                'exception' => $e,
            ]);
        }
    }

    /**
     * Handle a job failure.
     *
     * @param  TimesheetApproved  $event
     * @param  \Throwable  $exception
     * @return void;
     */
    public function failed(TimesheetApproved $event, \Throwable $exception)
    {
        // Log the failure
        \Log::error('Failed to update work summary after timesheet approval: ' . $exception->getMessage(), [
            'timesheet_id' => $event->timesheet->id,
            'exception' => $exception,
        ]);
    }
}




