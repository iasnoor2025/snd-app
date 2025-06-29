<?php
namespace Modules\EmployeeManagement\Domain\Models\Models;

use Modules\EmployeeManagement\Domain\Models\Employee;
use Modules\PayrollManagement\Domain\Models\Payroll;
use Modules\PayrollManagement\Domain\Models\PayrollItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PayrollTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_has_correct_fillable_attributes()
    {
        $payroll = new Payroll();

        $this->assertEquals([
            'employee_id',
            'payroll_month',
            'base_salary',
            'total_allowances',
            'total_deductions',
            'overtime_hours',
            'overtime_amount',
            'gross_salary',
            'net_salary',
            'status',
            'notes',
            'batch_id',
            'processed_at',
            'processed_by',
            'meta_data',
        ], $payroll->getFillable());
    }

    /** @test */
    public function it_belongs_to_employee()
    {
        $payroll = new Payroll();

        $this->assertInstanceOf(BelongsTo::class, $payroll->employee());
        $this->assertInstanceOf(Employee::class, $payroll->employee()->getRelated());
    }

    /** @test */
    public function it_has_many_payroll_items()
    {
        $payroll = new Payroll();

        $this->assertInstanceOf(HasMany::class, $payroll->items());
        $this->assertInstanceOf(PayrollItem::class, $payroll->items()->getRelated());
    }

    /** @test */
    public function it_casts_payroll_month_as_date()
    {
        $payroll = new Payroll();

        $this->assertContains('payroll_month', array_keys($payroll->getCasts()));
        $this->assertEquals('date', $payroll->getCasts()['payroll_month']);
    }

    /** @test */
    public function it_calculates_gross_salary_correctly()
    {
        // Create a payroll with sample data
        $payroll = Payroll::factory()->create([
            'base_salary' => 5000,
            'total_allowances' => 1000,
            'overtime_amount' => 500,
        ]);

        // Calculate gross salary (base + allowances + overtime)
        $expectedGrossSalary = 5000 + 1000 + 500;

        // Use a getter method if exists or access the attribute directly
        $this->assertEquals($expectedGrossSalary, $payroll->gross_salary);
    }

    /** @test */
    public function it_calculates_net_salary_correctly()
    {
        // Create a payroll with sample data
        $payroll = Payroll::factory()->create([
            'base_salary' => 5000,
            'total_allowances' => 1000,
            'overtime_amount' => 500,
            'total_deductions' => 1200,
        ]);

        // Calculate net salary (gross - deductions)
        $grossSalary = 5000 + 1000 + 500;
        $expectedNetSalary = $grossSalary - 1200;

        // Use a getter method if exists or access the attribute directly
        $this->assertEquals($expectedNetSalary, $payroll->net_salary);
    }

    /** @test */
    public function it_can_process_payroll()
    {
        // Create an employee and a payroll record
        $employee = Employee::factory()->create([
            'salary' => 5000
        ]);

        $payroll = Payroll::factory()->create([
            'employee_id' => $employee->id,
            'base_salary' => $employee->salary,
            'status' => 'pending'
        ]);

        // Process the payroll
        $payroll->process();

        // Verify payroll is now processed
        $this->assertEquals('processed', $payroll->status);
        $this->assertNotNull($payroll->processed_at);
    }
}

