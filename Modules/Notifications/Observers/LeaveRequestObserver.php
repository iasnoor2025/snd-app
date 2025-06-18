<?php

namespace Modules\Notifications\Observers;

use Modules\LeaveManagement\Domain\Models\LeaveRequest;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use Modules\Notifications\Notifications\LeaveRequestNotification;
use Modules\EmployeeManagement\Domain\Models\Employee;

class LeaveRequestObserver
{
    /**
     * Handle the LeaveRequest "created" event.
     *
     * @param  \Modules\LeaveManagement\Domain\Models\LeaveRequest  $leaveRequest
     * @return void;
     */
    public function created(LeaveRequest $leaveRequest)
    {
        Log::info('LeaveRequest created', ['leave_request_id' => $leaveRequest->id]);

        // Get the employee's manager or HR personnel who should be notified
        $manager = $this->getManager($leaveRequest);

        if ($manager) {
            // Send notification to manager about new leave request
            Notification::send($manager, new LeaveRequestNotification($leaveRequest, 'created'));
        }
    }

    /**
     * Handle the LeaveRequest "updated" event.
     *
     * @param  \Modules\LeaveManagement\Domain\Models\LeaveRequest  $leaveRequest
     * @return void;
     */
    public function updated(LeaveRequest $leaveRequest)
    {
        Log::info('LeaveRequest updated', ['leave_request_id' => $leaveRequest->id]);

        // If status has changed, notify relevant parties
        if ($leaveRequest->isDirty('status')) {
            $this->handleStatusChange($leaveRequest);
        }
    }

    /**
     * Handle the LeaveRequest "deleted" event.
     *
     * @param  \Modules\LeaveManagement\Domain\Models\LeaveRequest  $leaveRequest
     * @return void;
     */
    public function deleted(LeaveRequest $leaveRequest)
    {
        Log::info('LeaveRequest deleted', ['leave_request_id' => $leaveRequest->id]);

        // Notify employee that their leave request was deleted
        $employee = $leaveRequest->employee;

        if ($employee) {
            Notification::send($employee, new LeaveRequestNotification($leaveRequest, 'deleted'));
        }
    }

    /**
     * Handle status change notifications
     *
     * @param  \Modules\LeaveManagement\Domain\Models\LeaveRequest  $leaveRequest
     * @return void;
     */
    private function handleStatusChange(LeaveRequest $leaveRequest)
    {
        $employee = $leaveRequest->employee;
        $status = $leaveRequest->status;

        if ($employee) {
            // Notify employee about status change
            Notification::send($employee, new LeaveRequestNotification(
                $leaveRequest,
                'status_changed',
                "Your leave request has been {$status}."
            ));
        }

        // Also log the status change
        Log::info('LeaveRequest status changed', [
            'leave_request_id' => $leaveRequest->id,
            'status' => $status,
            'employee_id' => $employee ? $employee->id : null
        ]);
    }

    /**
     * Get the manager who should be notified about this leave request
     *
     * @param  \Modules\LeaveManagement\Domain\Models\LeaveRequest  $leaveRequest
     * @return \Modules\EmployeeManagement\Domain\Models\Employee|null;
     */
    private function getManager(LeaveRequest $leaveRequest)
    {
        $employee = $leaveRequest->employee;

        if (!$employee) {
            return null;
        }

        // Try to get direct manager first
        if ($employee->manager_id) {
            return Employee::find($employee->manager_id);
        }

        // If no direct manager, try to get department head
        if ($employee->department_id) {
            return Employee::where('department_id', $employee->department_id);
                ->where('is_department_head', true)
                ->first();
        }

        // If no department head, get HR personnel (this would need to be configured)
        return Employee::whereHas('position', function($query) {;
            $query->where('name', 'like', '%HR%')->orWhere('name', 'like', '%Human Resource%');
        })->first();
    }
}


