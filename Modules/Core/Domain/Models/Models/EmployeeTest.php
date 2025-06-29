<?php
namespace Modules\Core\Domain\Models\Models;

use Modules\EmployeeManagement\Domain\Models\Employee;
use Modules\Core\Domain\Models\User;
use Modules\EmployeeManagement\Domain\Models\EmployeeAssignment;
use Modules\PayrollManagement\Domain\Models\EmployeeSalary;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class EmployeeTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_has_correct_fillable_attributes()
    {
        $employee = new Employee();

        $this->assertEquals([
            'user_id',
            'employee_id',
            'first_name',
            'last_name',
            'email',
            'phone',
            'position',
            'department',
            'hire_date',
            'salary',
            'hourly_rate',
            'status',
            'address',
            'emergency_contact',
            'emergency_phone',
            'file_number',
            'employment_type',
            'location_id',
            'bank_name',
            'bank_account',
            'bank_branch',
            'meta_data',
        ], $employee->getFillable());
    }

    /** @test */
    public function it_belongs_to_user()
    {
        $employee = new Employee();

        $this->assertInstanceOf(BelongsTo::class, $employee->user());
        $this->assertInstanceOf(User::class, $employee->user()->getRelated());
    }

    /** @test */
    public function it_has_many_employee_assignments()
    {
        $employee = new Employee();

        $this->assertInstanceOf(HasMany::class, $employee->assignments());
        $this->assertInstanceOf(EmployeeAssignment::class, $employee->assignments()->getRelated());
    }

    /** @test */
    public function it_has_current_salary()
    {
        $employee = new Employee();

        $this->assertInstanceOf(HasOne::class, $employee->currentSalary());
        $this->assertInstanceOf(EmployeeSalary::class, $employee->currentSalary()->getRelated());
    }

    /** @test */
    public function it_has_salary_history()
    {
        $employee = new Employee();

        $this->assertInstanceOf(HasMany::class, $employee->salaryHistory());
        $this->assertInstanceOf(EmployeeSalary::class, $employee->salaryHistory()->getRelated());
    }

    /** @test */
    public function it_can_generate_file_number()
    {
        // Create an employee and verify the file number is generated properly
        $employee = Employee::factory()->create([
            'file_number' => null
        ]);

        $this->assertNotNull($employee->file_number);
        $this->assertStringStartsWith('EMP-', $employee->file_number);
    }

    /** @test */
    public function it_has_full_name_attribute()
    {
        $employee = Employee::factory()->create([
            'first_name' => 'John',
            'last_name' => 'Doe'
        ]);

        $this->assertEquals('John Doe', $employee->full_name);
    }

    /** @test */
    public function it_calculates_hourly_rate_correctly()
    {
        $employee = Employee::factory()->create([
            'salary' => 5000, // Monthly salary
        ]);

        // Assuming hourly rate is calculated as (monthly salary / (22 days * 8 hours))
        $expectedHourlyRate = 5000 / (22 * 8);

        $this->assertEquals($expectedHourlyRate, $employee->hourly_rate);
    }

    /** @test */
    public function it_calculates_overtime_rate_correctly()
    {
        $employee = Employee::factory()->create([
            'hourly_rate' => 20
        ]);

        // Assuming overtime rate is 1.5 * hourly rate
        $overtimeRate = $employee->overtimeRate();

        $this->assertEquals(30, $overtimeRate); // 20 * 1.5 = 30
    }
}

