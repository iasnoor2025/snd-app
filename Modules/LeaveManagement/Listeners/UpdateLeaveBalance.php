<?php

namespace Modules\LeaveManagement\Listeners;

use Modules\LeaveManagement\Events\LeaveApproved;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Modules\LeaveManagement\Domain\Models\LeaveBalance;

class UpdateLeaveBalance implements ShouldQueue
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
     * @return void
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     *
     * @param  LeaveApproved  $event
     * @return void
     */
    public function handle(LeaveApproved $event)
    {
        $leave = $event->leave;

        // Find or create leave balance for the employee and leave type
        $leaveBalance = LeaveBalance::firstOrCreate(
            [
                'employee_id' => $leave->employee_id,
                'leave_type_id' => $leave->leave_type_id,
                'year' => $leave->start_date->year,
            ],
            [
                'allocated_days' => $leave->leaveType->max_days ?? 0,
                'used_days' => 0,
                'remaining_days' => $leave->leaveType->max_days ?? 0,
            ]
        );

        // Update the leave balance
        $leaveBalance->used_days += $leave->days_count;
        $leaveBalance->remaining_days = $leaveBalance->allocated_days - $leaveBalance->used_days;
        $leaveBalance->save();
    }

    /**
     * Handle a job failure.
     *
     * @param  LeaveApproved  $event
     * @param  \Throwable  $exception
     * @return void
     */
    public function failed(LeaveApproved $event, $exception)
    {
        // Log the failure or handle it appropriately
        \Log::error('Failed to update leave balance', [
            'leave_id' => $event->leave->id,
            'employee_id' => $event->leave->employee_id,
            'leave_type_id' => $event->leave->leave_type_id,
            'exception' => $exception->getMessage()
        ]);
    }
}
