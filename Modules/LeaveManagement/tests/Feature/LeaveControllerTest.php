<?php
namespace Modules\LeaveManagement\tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\LeaveManagement\Domain\Models\Leave;
use Modules\LeaveManagement\Domain\Models\LeaveType;
use Modules\Employee\Domain\Models\Employee;
use Modules\Core\Domain\Models\User;
use Illuminate\Support\Carbon;

class LeaveControllerTest extends TestCase
{
    use RefreshDatabase;
use protected $user;
    protected $employee;
    protected $leaveType;

    public function setUp(): void
    {
        parent::setUp();

        // Create user with employee
        $this->user = User::factory()->create();
        $this->employee = Employee::factory()->create([
            'user_id' => $this->user->id
        ]);

        // Create leave type
        $this->leaveType = LeaveType::factory()->create([
            'name' => 'Annual Leave',
            'days_allowed' => 20,
        ]);
    }

    /** @test */
    public function authenticated_user_can_see_leave_index_page()
    {
        // Create some leaves for the employee
        $leave = Leave::factory()->create([
            'employee_id' => $this->employee->id,
            'leave_type_id' => $this->leaveType->id,
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('leaves.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($assert) => $assert
            ->component('LeaveManagement::Index')
            ->has('leaves.data', 1)
            ->has('leaveTypes')
        );
    }

    /** @test */
    public function authenticated_user_can_create_leave_request()
    {
        $response = $this->actingAs($this->user)
            ->get(route('leaves.create'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($assert) => $assert
            ->component('LeaveManagement::Create')
            ->has('leaveTypes')
        );
    }

    /** @test */
    public function authenticated_user_can_store_leave_request()
    {
        $leaveData = [
            'leave_type_id' => $this->leaveType->id,
            'start_date' => Carbon::now()->addDays(1)->format('Y-m-d'),
            'end_date' => Carbon::now()->addDays(5)->format('Y-m-d'),
            'half_day' => false,
            'reason' => 'Taking some time off for vacation.',
        ];

        $response = $this->actingAs($this->user)
            ->post(route('leaves.store'), $leaveData);

        $response->assertRedirect(route('leaves.index'));
        $response->assertSessionHas('success');

        // Assert that the leave was created in the database
        $this->assertDatabaseHas('leaves', [
            'employee_id' => $this->employee->id,
            'leave_type_id' => $this->leaveType->id,
            'reason' => $leaveData['reason'],
            'status' => 'pending',
        ]);
    }

    /** @test */
    public function authenticated_user_can_view_leave_details()
    {
        $leave = Leave::factory()->create([
            'employee_id' => $this->employee->id,
            'leave_type_id' => $this->leaveType->id,
            'status' => 'approved',
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('leaves.show', $leave->id));

        $response->assertStatus(200);
        $response->assertInertia(fn ($assert) => $assert
            ->component('LeaveManagement::Show')
            ->has('leave')
        );
    }

    /** @test */
    public function authenticated_user_can_edit_pending_leave()
    {
        $leave = Leave::factory()->create([
            'employee_id' => $this->employee->id,
            'leave_type_id' => $this->leaveType->id,
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('leaves.edit', $leave->id));

        $response->assertStatus(200);
        $response->assertInertia(fn ($assert) => $assert
            ->component('LeaveManagement::Edit')
            ->has('leave')
            ->has('leaveTypes')
        );
    }

    /** @test */
    public function authenticated_user_can_update_pending_leave()
    {
        $leave = Leave::factory()->create([
            'employee_id' => $this->employee->id,
            'leave_type_id' => $this->leaveType->id,
            'status' => 'pending',
            'reason' => 'Initial reason',
        ]);

        $updatedData = [
            'leave_type_id' => $this->leaveType->id,
            'start_date' => Carbon::now()->addDays(2)->format('Y-m-d'),
            'end_date' => Carbon::now()->addDays(6)->format('Y-m-d'),
            'reason' => 'Updated reason for leave',
        ];

        $response = $this->actingAs($this->user)
            ->put(route('leaves.update', $leave->id), $updatedData);

        $response->assertRedirect(route('leaves.index'));
        $response->assertSessionHas('success');

        // Assert that the leave was updated in the database
        $this->assertDatabaseHas('leaves', [
            'id' => $leave->id,
            'employee_id' => $this->employee->id,
            'reason' => 'Updated reason for leave',
        ]);
    }

    /** @test */
    public function authenticated_user_can_delete_pending_leave()
    {
        $leave = Leave::factory()->create([
            'employee_id' => $this->employee->id,
            'leave_type_id' => $this->leaveType->id,
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->user)
            ->delete(route('leaves.destroy', $leave->id));

        $response->assertRedirect(route('leaves.index'));
        $response->assertSessionHas('success');

        // Assert that the leave was soft deleted from the database
        $this->assertSoftDeleted('leaves', [
            'id' => $leave->id
        ]);
    }
}


