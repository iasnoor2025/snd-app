<?php

namespace Modules\LeaveManagement\Observers;

use Modules\LeaveManagement\Domain\Models\LeaveRequest;
use Illuminate\Support\Facades\Log;

class LeaveRequestObserver
{
    /**
     * Handle the LeaveRequest "created" event.
     *
     * @param  \Modules\LeaveManagement\Domain\Models\LeaveRequest  $leaveRequest
     * @return void
     */
    public function created(LeaveRequest $leaveRequest)
    {
        Log::info('Leave request created', ['id' => $leaveRequest->id, 'user_id' => $leaveRequest->user_id]);
    }

    /**
     * Handle the LeaveRequest "updated" event.
     *
     * @param  \Modules\LeaveManagement\Domain\Models\LeaveRequest  $leaveRequest
     * @return void
     */
    public function updated(LeaveRequest $leaveRequest)
    {
        Log::info('Leave request updated', ['id' => $leaveRequest->id, 'status' => $leaveRequest->status]);
    }

    /**
     * Handle the LeaveRequest "deleted" event.
     *
     * @param  \Modules\LeaveManagement\Domain\Models\LeaveRequest  $leaveRequest
     * @return void
     */
    public function deleted(LeaveRequest $leaveRequest)
    {
        Log::info('Leave request deleted', ['id' => $leaveRequest->id]);
    }

    /**
     * Handle the LeaveRequest "restored" event.
     *
     * @param  \Modules\LeaveManagement\Domain\Models\LeaveRequest  $leaveRequest
     * @return void
     */
    public function restored(LeaveRequest $leaveRequest)
    {
        Log::info('Leave request restored', ['id' => $leaveRequest->id]);
    }

    /**
     * Handle the LeaveRequest "force deleted" event.
     *
     * @param  \Modules\LeaveManagement\Domain\Models\LeaveRequest  $leaveRequest
     * @return void
     */
    public function forceDeleted(LeaveRequest $leaveRequest)
    {
        Log::info('Leave request force deleted', ['id' => $leaveRequest->id]);
    }
}


