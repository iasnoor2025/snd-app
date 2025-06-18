<?php

namespace Modules\Notifications\Observers;

use Modules\Notifications\Domain\Models\Leave;
use Illuminate\Support\Facades\Log;

class LeaveObserver
{
    /**
     * Handle the Leave "created" event.
     *
     * @param  \Modules\Notifications\Domain\Models\Leave  $leave
     * @return void;
     */
    public function created(Leave $leave)
    {
        Log::info('Leave created', ['leave_id' => $leave->id]);
    }

    /**
     * Handle the Leave "updated" event.
     *
     * @param  \Modules\Notifications\Domain\Models\Leave  $leave
     * @return void;
     */
    public function updated(Leave $leave)
    {
        Log::info('Leave updated', ['leave_id' => $leave->id]);
    }

    /**
     * Handle the Leave "deleted" event.
     *
     * @param  \Modules\Notifications\Domain\Models\Leave  $leave
     * @return void;
     */
    public function deleted(Leave $leave)
    {
        Log::info('Leave deleted', ['leave_id' => $leave->id]);
    }
}


