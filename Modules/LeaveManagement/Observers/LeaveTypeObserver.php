<?php

namespace Modules\LeaveManagement\Observers;

use Modules\LeaveManagement\Domain\Models\LeaveType;
use Illuminate\Support\Facades\Log;

class LeaveTypeObserver
{
    /**
     * Handle the LeaveType "created" event.
     *
     * @param  \Modules\LeaveManagement\Domain\Models\LeaveType  $leaveType
     * @return void
     */
    public function created(LeaveType $leaveType)
    {
        Log::info('Leave type created', ['id' => $leaveType->id, 'name' => $leaveType->name]);
    }

    /**
     * Handle the LeaveType "updated" event.
     *
     * @param  \Modules\LeaveManagement\Domain\Models\LeaveType  $leaveType
     * @return void
     */
    public function updated(LeaveType $leaveType)
    {
        Log::info('Leave type updated', ['id' => $leaveType->id, 'name' => $leaveType->name]);
    }

    /**
     * Handle the LeaveType "deleted" event.
     *
     * @param  \Modules\LeaveManagement\Domain\Models\LeaveType  $leaveType
     * @return void
     */
    public function deleted(LeaveType $leaveType)
    {
        Log::info('Leave type deleted', ['id' => $leaveType->id]);
    }

    /**
     * Handle the LeaveType "restored" event.
     *
     * @param  \Modules\LeaveManagement\Domain\Models\LeaveType  $leaveType
     * @return void
     */
    public function restored(LeaveType $leaveType)
    {
        Log::info('Leave type restored', ['id' => $leaveType->id]);
    }

    /**
     * Handle the LeaveType "force deleted" event.
     *
     * @param  \Modules\LeaveManagement\Domain\Models\LeaveType  $leaveType
     * @return void
     */
    public function forceDeleted(LeaveType $leaveType)
    {
        Log::info('Leave type force deleted', ['id' => $leaveType->id]);
    }
}


