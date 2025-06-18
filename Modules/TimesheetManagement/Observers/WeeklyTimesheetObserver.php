<?php

namespace Modules\TimesheetManagement\Observers;

use Modules\TimesheetManagement\Domain\Models\WeeklyTimesheet;
use Modules\TimesheetManagement\Events\TimesheetSubmitted;
use Modules\TimesheetManagement\Events\TimesheetApproved;
use Modules\TimesheetManagement\Events\TimesheetRejected;
use Modules\TimesheetManagement\Events\TimesheetUpdated;
use Carbon\Carbon;

class WeeklyTimesheetObserver
{
    /**
     * Handle the WeeklyTimesheet "created" event.
     *
     * @param  \Modules\TimesheetManagement\Domain\Models\WeeklyTimesheet  $weeklyTimesheet
     * @return void
     */
    public function created(WeeklyTimesheet $weeklyTimesheet)
    {
        //
    }

    /**
     * Handle the WeeklyTimesheet "updated" event.
     *
     * @param  \Modules\TimesheetManagement\Domain\Models\WeeklyTimesheet  $weeklyTimesheet
     * @return void
     */
    public function updated(WeeklyTimesheet $weeklyTimesheet)
    {
        // Check if the status was changed to submitted
        if ($weeklyTimesheet->isDirty('status') && $weeklyTimesheet->status === 'submitted') {
            $this->handleSubmitted($weeklyTimesheet);
        }

        // Check if the status was changed to approved
        if ($weeklyTimesheet->isDirty('status') && $weeklyTimesheet->status === 'approved') {
            $this->handleApproved($weeklyTimesheet);
        }

        // Check if the status was changed to rejected
        if ($weeklyTimesheet->isDirty('status') && $weeklyTimesheet->status === 'rejected') {
            $this->handleRejected($weeklyTimesheet);
        }

        // General update event
        if (!$weeklyTimesheet->isDirty('status')) {
            event(new TimesheetUpdated($weeklyTimesheet));
        }
    }

    /**
     * Handle the WeeklyTimesheet "deleted" event.
     *
     * @param  \Modules\TimesheetManagement\Domain\Models\WeeklyTimesheet  $weeklyTimesheet
     * @return void
     */
    public function deleted(WeeklyTimesheet $weeklyTimesheet)
    {
        //
    }

    /**
     * Handle the WeeklyTimesheet "restored" event.
     *
     * @param  \Modules\TimesheetManagement\Domain\Models\WeeklyTimesheet  $weeklyTimesheet
     * @return void
     */
    public function restored(WeeklyTimesheet $weeklyTimesheet)
    {
        //
    }

    /**
     * Handle the WeeklyTimesheet "force deleted" event.
     *
     * @param  \Modules\TimesheetManagement\Domain\Models\WeeklyTimesheet  $weeklyTimesheet
     * @return void
     */
    public function forceDeleted(WeeklyTimesheet $weeklyTimesheet)
    {
        //
    }

    /**
     * Handle timesheet submission
     *
     * @param  \Modules\TimesheetManagement\Domain\Models\WeeklyTimesheet  $weeklyTimesheet
     * @return void
     */
    protected function handleSubmitted(WeeklyTimesheet $weeklyTimesheet)
    {
        // Set submitted timestamp if not already set
        if (empty($weeklyTimesheet->submitted_at)) {
            $weeklyTimesheet->submitted_at = Carbon::now();
            $weeklyTimesheet->saveQuietly();
        }

        // Dispatch event
        event(new TimesheetSubmitted($weeklyTimesheet));
    }

    /**
     * Handle timesheet approval
     *
     * @param  \Modules\TimesheetManagement\Domain\Models\WeeklyTimesheet  $weeklyTimesheet
     * @return void
     */
    protected function handleApproved(WeeklyTimesheet $weeklyTimesheet)
    {
        // Set approval timestamp if not already set
        if (empty($weeklyTimesheet->approved_at)) {
            $weeklyTimesheet->approved_at = Carbon::now();
            $weeklyTimesheet->saveQuietly();
        }

        // Dispatch event
        event(new TimesheetApproved($weeklyTimesheet));
    }

    /**
     * Handle timesheet rejection
     *
     * @param  \Modules\TimesheetManagement\Domain\Models\WeeklyTimesheet  $weeklyTimesheet
     * @return void
     */
    protected function handleRejected(WeeklyTimesheet $weeklyTimesheet)
    {
        // Set rejection timestamp if not already set
        if (empty($weeklyTimesheet->rejected_at)) {
            $weeklyTimesheet->rejected_at = Carbon::now();
            $weeklyTimesheet->saveQuietly();
        }

        // Dispatch event
        event(new TimesheetRejected($weeklyTimesheet));
    }
}


