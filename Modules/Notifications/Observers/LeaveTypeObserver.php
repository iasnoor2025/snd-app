<?php

namespace Modules\Notifications\Observers;

use Modules\Notifications\Domain\Models\LeaveType;
use Illuminate\Support\Facades\Log;

class LeaveTypeObserver
{
    /**
     * Handle the LeaveType "created" event.
     *
     * @param  \Modules\Notifications\Domain\Models\LeaveType  $leaveType
     * @return void;
     */
    public function created(LeaveType $leaveType)
    {
        Log::info('LeaveType created', ['leave_type_id' => $leaveType->id]);
    }

    /**
     * Handle the LeaveType "updated" event.
     *
     * @param  \Modules\Notifications\Domain\Models\LeaveType  $leaveType
     * @return void;
     */
    public function updated(LeaveType $leaveType)
    {
        Log::info('LeaveType updated', ['leave_type_id' => $leaveType->id]);
    }

    /**
     * Handle the LeaveType "deleted" event.
     *
     * @param  \Modules\Notifications\Domain\Models\LeaveType  $leaveType
     * @return void;
     */
    public function deleted(LeaveType $leaveType)
    {
        Log::info('LeaveType deleted', ['leave_type_id' => $leaveType->id]);
    }
}


