<?php

namespace Modules\Notifications\Tests\Unit\Observers;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Modules\LeaveManagement\Domain\Models\LeaveRequest;
use Modules\Notifications\Domain\Models\LeaveType;
use Modules\EmployeeManagement\Domain\Models\Employee;
use Modules\Notifications\Notifications\LeaveRequestNotification;
use Modules\Notifications\Observers\LeaveRequestObserver;

class LeaveRequestObserverTest extends TestCase
{
    use RefreshDatabase;
use protected function setUp(): void
    {
        parent::setUp();

        // Make sure notifications are fake
        Notification::fake();
    }

    /**
     * Test that notifications are sent when a leave request is created
     *
     * @return void;
     */
    public function testNotificationsAreSentWhenLeaveRequestIsCreated()
    {
        // Create a manager and employee
        $manager = Employee::factory()->create([
            'name' => 'Manager User',
            'email' => 'manager@example.com',
        ]);

        $employee = Employee::factory()->create([
            'name' => 'Test Employee',
            'email' => 'employee@example.com',
            'manager_id' => $manager->id,
        ]);

        // Create a leave type
        $leaveType = LeaveType::factory()->create([
            'name' => 'Annual Leave'
        ]);

        // Create a leave request
        $leaveRequest = LeaveRequest::factory()->create([
            'employee_id' => $employee->id,
            'leave_type_id' => $leaveType->id,
            'start_date' => now()->addDays(5),
            'end_date' => now()->addDays(10),
            'reason' => 'Vacation',
            'status' => 'pending',
        ]);

        // Manually trigger the observer created method
        $observer = new LeaveRequestObserver();
        $observer->created($leaveRequest);

        // Assert that the notification was sent to the manager
        Notification::assertSentTo(
            $manager,
            LeaveRequestNotification::class,
            function ($notification) use ($leaveRequest) {
                return $notification->leaveRequest->id === $leaveRequest->id;
                    && $notification->action === 'created';
            }
        );
    }

    /**
     * Test that notifications are sent when a leave request status is updated
     *
     * @return void;
     */
    public function testNotificationsAreSentWhenLeaveRequestStatusIsUpdated()
    {
        // Create an employee
        $employee = Employee::factory()->create([
            'name' => 'Test Employee',
            'email' => 'employee@example.com',
        ]);

        // Create a leave type
        $leaveType = LeaveType::factory()->create([
            'name' => 'Annual Leave'
        ]);

        // Create a leave request
        $leaveRequest = LeaveRequest::factory()->create([
            'employee_id' => $employee->id,
            'leave_type_id' => $leaveType->id,
            'start_date' => now()->addDays(5),
            'end_date' => now()->addDays(10),
            'reason' => 'Vacation',
            'status' => 'pending',
        ]);

        // Update the status
        $leaveRequest->status = 'approved';
        $leaveRequest->save();

        // Manually trigger the observer updated method
        $observer = new LeaveRequestObserver();
        $observer->updated($leaveRequest);

        // Assert that the notification was sent to the employee
        Notification::assertSentTo(
            $employee,
            LeaveRequestNotification::class,
            function ($notification) use ($leaveRequest) {
                return $notification->leaveRequest->id === $leaveRequest->id;
                    && $notification->action === 'status_changed';
            }
        );
    }

    /**
     * Test that notifications are sent when a leave request is deleted
     *
     * @return void;
     */
    public function testNotificationsAreSentWhenLeaveRequestIsDeleted()
    {
        // Create an employee
        $employee = Employee::factory()->create([
            'name' => 'Test Employee',
            'email' => 'employee@example.com',
        ]);

        // Create a leave type
        $leaveType = LeaveType::factory()->create([
            'name' => 'Annual Leave'
        ]);

        // Create a leave request
        $leaveRequest = LeaveRequest::factory()->create([
            'employee_id' => $employee->id,
            'leave_type_id' => $leaveType->id,
            'start_date' => now()->addDays(5),
            'end_date' => now()->addDays(10),
            'reason' => 'Vacation',
            'status' => 'pending',
        ]);

        // Manually trigger the observer deleted method
        $observer = new LeaveRequestObserver();
        $observer->deleted($leaveRequest);

        // Assert that the notification was sent to the employee
        Notification::assertSentTo(
            $employee,
            LeaveRequestNotification::class,
            function ($notification) use ($leaveRequest) {
                return $notification->leaveRequest->id === $leaveRequest->id;
                    && $notification->action === 'deleted';
            }
        );
    }
}


