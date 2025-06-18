<?php
namespace Modules\EmployeeManagement\tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\EmployeeManagement\Domain\Models\Employee;
use Tests\TestCase;

class EmployeeControllerTest extends TestCase
{
    use RefreshDatabase;
    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutExceptionHandling();
    }

    public function test_can_list_employees(): void
    {
        Employee::factory()->count(3)->create();

        $response = $this->getJson('/api/employees');

        $response->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'first_name',
                        'last_name',
                        'email',
                        'position',
                        'department',
                        'status',
                    ]
                ]
            ]);
    }

    public function test_can_create_employee(): void
    {
        $employeeData = [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john.doe@example.com',
            'phone' => '1234567890',
            'position_id' => 1,
            'department_id' => 1,
            'basic_salary' => 5000,
            'food_allowance' => 500,
            'housing_allowance' => 1000,
            'transport_allowance' => 300,
        ];

        $response = $this->postJson('/api/employees', $employeeData);

        $response->assertCreated()
            ->assertJsonStructure([
                'id',
                'first_name',
                'last_name',
                'email',
                'position',
                'department',
                'status',
            ]);

        $this->assertDatabaseHas('employees', [
            'email' => 'john.doe@example.com',
            'first_name' => 'John',
            'last_name' => 'Doe',
        ]);
    }

    public function test_can_show_employee(): void
    {
        $employee = Employee::factory()->create();

        $response = $this->getJson("/api/employees/{$employee->id}");

        $response->assertOk()
            ->assertJsonStructure([
                'id',
                'first_name',
                'last_name',
                'email',
                'position',
                'department',
                'status',
                'current_salary',
                'salary_history',
                'timesheets',
                'leave_requests',
                'performance_reviews',
                'documents',
            ]);
    }

    public function test_can_update_employee(): void
    {
        $employee = Employee::factory()->create();
        $updateData = [
            'first_name' => 'Updated',
            'last_name' => 'Name',
            'email' => 'updated@example.com',
        ];

        $response = $this->putJson("/api/employees/{$employee->id}", $updateData);

        $response->assertOk()
            ->assertJson([
                'first_name' => 'Updated',
                'last_name' => 'Name',
                'email' => 'updated@example.com',
            ]);

        $this->assertDatabaseHas('employees', [
            'id' => $employee->id,
            'first_name' => 'Updated',
            'last_name' => 'Name',
            'email' => 'updated@example.com',
        ]);
    }

    public function test_can_delete_employee(): void
    {
        $employee = Employee::factory()->create();

        $response = $this->deleteJson("/api/employees/{$employee->id}");

        $response->assertNoContent();

        $this->assertSoftDeleted('employees', [
            'id' => $employee->id
        ]);
    }

    public function test_can_get_employee_salary_history(): void
    {
        $employee = Employee::factory()->create();

        $response = $this->getJson("/api/employees/{$employee->id}/salary-history");

        $response->assertOk()
            ->assertJsonStructure([
                'current_salary',
                'salary_history',
            ]);
    }

    public function test_can_get_employee_timesheet_history(): void
    {
        $employee = Employee::factory()->create();

        $response = $this->getJson("/api/employees/{$employee->id}/timesheet-history");

        $response->assertOk()
            ->assertJsonStructure([
                'timesheets',
                'total_hours',
                'overtime_hours',
            ]);
    }

    public function test_can_get_employee_leave_history(): void
    {
        $employee = Employee::factory()->create();

        $response = $this->getJson("/api/employees/{$employee->id}/leave-history");

        $response->assertOk()
            ->assertJsonStructure([
                'leave_requests',
                'total_leave_days',
            ]);
    }

    public function test_can_get_employee_performance_reviews(): void
    {
        $employee = Employee::factory()->create();

        $response = $this->getJson("/api/employees/{$employee->id}/performance-reviews");

        $response->assertOk()
            ->assertJsonStructure([
                'performance_reviews'
            ]);
    }

    public function test_can_get_employee_documents(): void
    {
        $employee = Employee::factory()->create();

        $response = $this->getJson("/api/employees/{$employee->id}/documents");

        $response->assertOk()
            ->assertJsonStructure([
                'documents'
            ]);
    }
}


