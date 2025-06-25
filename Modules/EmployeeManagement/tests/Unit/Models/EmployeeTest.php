<?php

namespace Modules\EmployeeManagement\Tests\Unit\Models;

use Tests\TestCase;
use Modules\EmployeeManagement\Models\Employee;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeTest extends TestCase
{
    use RefreshDatabase;

    protected Employee $employee;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->employee = Employee::factory()->create([
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john.doe@example.com',
            'employee_id' => 'EMP001',
            'department' => 'IT',
            'position' => 'Developer',
            'hire_date' => '2024-01-01',
            'status' => 'active'
        ]);
    }

    /** @test */
    public function it_has_correct_fillable_attributes()
    {
        $fillable = [
            'first_name',
            'last_name',
            'email',
            'employee_id',
            'department',
            'position',
            'hire_date',
            'status',
            'phone',
            'address',
            'emergency_contact',
            'bank_account_details',
        ];

        $this->assertEquals($fillable, $this->employee->getFillable());
    }

    /** @test */
    public function it_has_correct_casts()
    {
        $expectedCasts = [
            'id' => 'integer',
            'hire_date' => 'date',
            'bank_account_details' => 'array',
            'emergency_contact' => 'array',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];

        $this->assertEquals($expectedCasts, $this->employee->getCasts());
    }

    /** @test */
    public function it_generates_full_name_attribute()
    {
        $this->assertEquals('John Doe', $this->employee->full_name);
    }

    /** @test */
    public function it_has_documents_relationship()
    {
        $this->assertInstanceOf(HasMany::class, $this->employee->documents());
    }

    /** @test */
    public function it_has_payslips_relationship()
    {
        $this->assertInstanceOf(HasMany::class, $this->employee->payslips());
    }

    /** @test */
    public function it_has_department_relationship()
    {
        $this->assertInstanceOf(BelongsTo::class, $this->employee->department());
    }

    /** @test */
    public function it_has_position_relationship()
    {
        $this->assertInstanceOf(BelongsTo::class, $this->employee->position());
    }

    /** @test */
    public function it_can_scope_active_employees()
    {
        Employee::factory()->create(['status' => 'inactive']);
        Employee::factory()->create(['status' => 'active']);

        $activeEmployees = Employee::active()->get();

        $this->assertEquals(2, $activeEmployees->count());
        $this->assertEquals('active', $activeEmployees->first()->status);
    }

    /** @test */
    public function it_can_scope_by_department()
    {
        Employee::factory()->create(['department' => 'HR']);
        Employee::factory()->create(['department' => 'IT']);

        $itEmployees = Employee::byDepartment('IT')->get();

        $this->assertEquals(2, $itEmployees->count());
        $this->assertEquals('IT', $itEmployees->first()->department);
    }

    /** @test */
    public function it_can_get_employment_duration()
    {
        $this->employee->hire_date = now()->subYears(2);
        $this->employee->save();

        $duration = $this->employee->getEmploymentDuration();

        $this->assertEquals(2, $duration->years);
    }

    /** @test */
    public function it_can_check_document_expiry()
    {
        $document = $this->employee->documents()->create([
            'type' => 'passport',
            'number' => 'P123456',
            'expiry_date' => now()->addMonth(),
        ]);

        $this->assertTrue($this->employee->hasExpiringDocuments());
        $this->assertCount(1, $this->employee->getExpiringDocuments());
    }

    /** @test */
    public function it_can_get_latest_payslip()
    {
        $oldPayslip = $this->employee->payslips()->create([
            'period' => '2024-02',
            'amount' => 5000,
            'generated_at' => now()->subMonth(),
        ]);

        $newPayslip = $this->employee->payslips()->create([
            'period' => '2024-03',
            'amount' => 5500,
            'generated_at' => now(),
        ]);

        $latestPayslip = $this->employee->getLatestPayslip();

        $this->assertEquals($newPayslip->id, $latestPayslip->id);
        $this->assertEquals('2024-03', $latestPayslip->period);
    }

    /** @test */
    public function it_can_calculate_years_of_service()
    {
        $this->employee->hire_date = now()->subYears(5)->subMonths(6);
        $this->employee->save();

        $yearsOfService = $this->employee->getYearsOfService();

        $this->assertEquals(5.5, $yearsOfService);
    }

    /** @test */
    public function it_can_get_document_history()
    {
        $this->employee->documents()->createMany([
            [
                'type' => 'contract',
                'number' => 'C001',
                'issued_date' => now()->subYears(2),
                'expiry_date' => now()->subYears(1),
            ],
            [
                'type' => 'contract',
                'number' => 'C002',
                'issued_date' => now()->subYear(),
                'expiry_date' => now()->addYear(),
            ],
        ]);

        $history = $this->employee->getDocumentHistory('contract');

        $this->assertCount(2, $history);
        $this->assertEquals('C002', $history->first()->number);
    }

    /** @test */
    public function it_can_get_salary_history()
    {
        $this->employee->payslips()->createMany([
            [
                'period' => '2024-01',
                'amount' => 5000,
                'generated_at' => now()->subMonths(2),
            ],
            [
                'period' => '2024-02',
                'amount' => 5500,
                'generated_at' => now()->subMonth(),
            ],
            [
                'period' => '2024-03',
                'amount' => 6000,
                'generated_at' => now(),
            ],
        ]);

        $history = $this->employee->getSalaryHistory();

        $this->assertCount(3, $history);
        $this->assertEquals(6000, $history->first()->amount);
        $this->assertTrue($history->first()->amount > $history->last()->amount);
    }
}
