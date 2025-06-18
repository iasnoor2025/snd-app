<?php
namespace Modules\LeaveManagement\tests\Unit;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\LeaveManagement\Domain\Models\Leave;
use Modules\LeaveManagement\Domain\Models\LeaveType;
use Modules\Employee\Domain\Models\Employee;
use Modules\Core\Domain\Models\User;
use Illuminate\Support\Carbon;

class LeaveTest extends TestCase
{
    use RefreshDatabase;
use public function setUp(): void
    {
        parent::setUp();

        // Set up any global prerequisites here
    }

    /** @test */
    public function it_calculates_days_count_correctly_for_normal_leave()
    {
        // Create leave type
        $leaveType = LeaveType::factory()->create();

        // Create employee
        $employee = Employee::factory()->create();

        // Create a leave with 5 days duration (excluding weekends)
        $leave = Leave::factory()->create([
            'employee_id' => $employee->id,
            'leave_type_id' => $leaveType->id,
            'start_date' => Carbon::parse('2023-01-09'), // Monday
            'end_date' => Carbon::parse('2023-01-13'), // Friday
            'half_day' => false,
        ]);

        $this->assertEquals(5, $leave->days_count);
    }

    /** @test */
    public function it_calculates_days_count_for_half_day_leave()
    {
        // Create leave type
        $leaveType = LeaveType::factory()->create();

        // Create employee
        $employee = Employee::factory()->create();

        // Create a half-day leave
        $leave = Leave::factory()->create([
            'employee_id' => $employee->id,
            'leave_type_id' => $leaveType->id,
            'start_date' => Carbon::parse('2023-01-09'), // Monday
            'end_date' => Carbon::parse('2023-01-09'), // Monday
            'half_day' => true,
        ]);

        $this->assertEquals(0.5, $leave->days_count);
    }

    /** @test */
    public function it_calculates_days_count_correctly_when_spanning_weekends()
    {
        // Create leave type
        $leaveType = LeaveType::factory()->create();

        // Create employee
        $employee = Employee::factory()->create();

        // Create a leave spanning a weekend (Friday to Tuesday)
        $leave = Leave::factory()->create([
            'employee_id' => $employee->id,
            'leave_type_id' => $leaveType->id,
            'start_date' => Carbon::parse('2023-01-06'), // Friday
            'end_date' => Carbon::parse('2023-01-10'), // Tuesday
            'half_day' => false,
        ]);

        // Should be 3 days (Friday, Monday, Tuesday)
        $this->assertEquals(3, $leave->days_count);
    }

    /** @test */
    public function it_has_correct_status_scopes()
    {
        // Create leave types
        $leaveType = LeaveType::factory()->create();

        // Create employee
        $employee = Employee::factory()->create();

        // Create a pending leave request
        $pendingLeave = Leave::factory()->create([
            'employee_id' => $employee->id,
            'leave_type_id' => $leaveType->id,
            'status' => 'pending',
        ]);

        // Create an approved leave request
        $approvedLeave = Leave::factory()->create([
            'employee_id' => $employee->id,
            'leave_type_id' => $leaveType->id,
            'status' => 'approved',
        ]);

        // Create a rejected leave request
        $rejectedLeave = Leave::factory()->create([
            'employee_id' => $employee->id,
            'leave_type_id' => $leaveType->id,
            'status' => 'rejected',
        ]);

        // Test pending scope
        $this->assertEquals(1, Leave::pending()->count());
        $this->assertTrue(Leave::pending()->first()->is($pendingLeave));

        // Test approved scope
        $this->assertEquals(1, Leave::approved()->count());
        $this->assertTrue(Leave::approved()->first()->is($approvedLeave));

        // Test rejected scope
        $this->assertEquals(1, Leave::rejected()->count());
        $this->assertTrue(Leave::rejected()->first()->is($rejectedLeave));
    }

    /** @test */
    public function it_has_correct_relationships()
    {
        // Create a user for approval
        $approver = User::factory()->create();

        // Create leave type
        $leaveType = LeaveType::factory()->create([
            'name' => 'Annual Leave'
        ]);

        // Create employee
        $employee = Employee::factory()->create();

        // Create a leave
        $leave = Leave::factory()->create([
            'employee_id' => $employee->id,
            'leave_type_id' => $leaveType->id,
            'status' => 'approved',
            'approved_by' => $approver->id,
        ]);

        // Test employee relationship
        $this->assertTrue($leave->employee->is($employee));

        // Test leave type relationship
        $this->assertTrue($leave->leaveType->is($leaveType));
        $this->assertEquals('Annual Leave', $leave->leaveType->name);

        // Test approver relationship
        $this->assertTrue($leave->approver->is($approver));
    }
}


