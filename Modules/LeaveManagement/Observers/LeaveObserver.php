<?php

namespace Modules\LeaveManagement\Observers;

use Modules\LeaveManagement\Domain\Models\Leave;
use Modules\LeaveManagement\Events\LeaveRequested;
use Modules\LeaveManagement\Events\LeaveApproved;
use Modules\LeaveManagement\Events\LeaveRejected;
use Modules\LeaveManagement\Events\LeaveUpdated;
use Modules\LeaveManagement\Events\LeaveDeleted;
use Illuminate\Support\Facades\Log;

class LeaveObserver
{
    /**
     * Handle the Leave "created" event.
     *
     * @param  \Modules\LeaveManagement\Domain\Models\Leave  $leave
     * @return void
     */
    public function created(Leave $leave)
    {
        Log::info('Leave created', ['id' => $leave->id, 'employee_id' => $leave->employee_id]);
        // Dispatch leave requested event when a new leave is created
        event(new LeaveRequested($leave));
    }

    /**
     * Handle the Leave "updated" event.
     *
     * @param  \Modules\LeaveManagement\Domain\Models\Leave  $leave
     * @return void
     */
    public function updated(Leave $leave)
    {
        Log::info('Leave updated', ['id' => $leave->id, 'status' => $leave->status]);
        // Check if status was changed to approved
        if ($leave->isDirty('status') && $leave->status === 'approved') {
            event(new LeaveApproved($leave));
        }

        // Check if status was changed to rejected
        if ($leave->isDirty('status') && $leave->status === 'rejected') {
            event(new LeaveRejected($leave));
        }

        // General update event
        if (!$leave->isDirty('status')) {
            event(new LeaveUpdated($leave));
        }
    }

    /**
     * Handle the Leave "deleted" event.
     *
     * @param  \Modules\LeaveManagement\Domain\Models\Leave  $leave
     * @return void
     */
    public function deleted(Leave $leave)
    {
        Log::info('Leave deleted', ['id' => $leave->id]);
        event(new LeaveDeleted($leave));
    }

    /**
     * Handle the Leave "restored" event.
     *
     * @param  \Modules\LeaveManagement\Domain\Models\Leave  $leave
     * @return void
     */
    public function restored(Leave $leave)
    {
        Log::info('Leave restored', ['id' => $leave->id]);
    }

    /**
     * Handle the Leave "force deleted" event.
     *
     * @param  \Modules\LeaveManagement\Domain\Models\Leave  $leave
     * @return void
     */
    public function forceDeleted(Leave $leave)
    {
        Log::info('Leave force deleted', ['id' => $leave->id]);
    }
}


