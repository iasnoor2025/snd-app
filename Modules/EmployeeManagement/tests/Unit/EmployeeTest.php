<?php
namespace Modules\EmployeeManagement\tests\Unit;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\EmployeeManagement\Domain\Models\Employee;
use Tests\TestCase;

class EmployeeTest extends TestCase
{
    use RefreshDatabase;
use private Employee $employee;

    protected function setUp(): void
    {
        parent::setUp();

        $this->employee = Employee::factory()->create([
            'first_name' => 'John',
            'middle_name' => 'William',
            'last_name' => 'Doe',
            'basic_salary' => 5000,
            'food_allowance' => 500,
            'housing_allowance' => 1000,
            'transport_allowance' => 300,
        ]);
    }

    public function test_employee_has_full_name(): void
    {
        $this->assertEquals('John William Doe', $this->employee->full_name);
    }

    public function test_employee_has_total_salary(): void
    {
        $this->assertEquals(6800, $this->employee->total_salary);
    }

    public function test_employee_has_total_allowances(): void
    {
        $this->assertEquals(1800, $this->employee->total_allowances);
    }

    public function test_employee_has_allowances_percentage(): void
    {
        $this->assertEquals(36, $this->employee->allowances_percentage);
    }

    public function test_employee_has_relationships(): void
    {
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\BelongsTo::class, $this->employee->user());
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\BelongsTo::class, $this->employee->position());
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\BelongsTo::class, $this->employee->department());
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\HasOne::class, $this->employee->currentSalary());
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class, $this->employee->salaries());
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class, $this->employee->timesheets());
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class, $this->employee->advances());
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class, $this->employee->leaves());
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class, $this->employee->performanceReviews());
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class, $this->employee->documents());
    }
}

