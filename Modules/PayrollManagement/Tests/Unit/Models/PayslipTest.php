<?php

namespace Modules\PayrollManagement\Tests\Unit\Models;

use Tests\TestCase;
use Modules\PayrollManagement\Models\Payslip;
use Modules\EmployeeManagement\Models\Employee;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class PayslipTest extends TestCase
{
    use RefreshDatabase;

    protected Payslip $payslip;
    protected Employee $employee;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->employee = Employee::factory()->create();
        
        $this->payslip = Payslip::factory()->create([
            'employee_id' => $this->employee->id,
            'period' => '2024-03',
            'basic_salary' => 5000,
            'allowances' => [
                ['name' => 'Housing', 'amount' => 1000],
                ['name' => 'Transport', 'amount' => 500],
            ],
            'deductions' => [
                ['name' => 'Tax', 'amount' => 500],
                ['name' => 'Insurance', 'amount' => 200],
            ],
            'generated_at' => now(),
            'status' => 'generated',
        ]);
    }

    /** @test */
    public function it_has_correct_fillable_attributes()
    {
        $fillable = [
            'employee_id',
            'period',
            'basic_salary',
            'allowances',
            'deductions',
            'generated_at',
            'status',
            'file_path',
            'notes',
        ];

        $this->assertEquals($fillable, $this->payslip->getFillable());
    }

    /** @test */
    public function it_has_correct_casts()
    {
        $expectedCasts = [
            'id' => 'integer',
            'employee_id' => 'integer',
            'basic_salary' => 'decimal:2',
            'allowances' => 'array',
            'deductions' => 'array',
            'generated_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];

        $this->assertEquals($expectedCasts, $this->payslip->getCasts());
    }

    /** @test */
    public function it_belongs_to_employee()
    {
        $this->assertInstanceOf(BelongsTo::class, $this->payslip->employee());
        $this->assertInstanceOf(Employee::class, $this->payslip->employee);
        $this->assertEquals($this->employee->id, $this->payslip->employee->id);
    }

    /** @test */
    public function it_calculates_gross_pay()
    {
        $expectedGrossPay = 6500; // Basic (5000) + Housing (1000) + Transport (500)
        
        $this->assertEquals($expectedGrossPay, $this->payslip->gross_pay);
    }

    /** @test */
    public function it_calculates_total_deductions()
    {
        $expectedDeductions = 700; // Tax (500) + Insurance (200)
        
        $this->assertEquals($expectedDeductions, $this->payslip->total_deductions);
    }

    /** @test */
    public function it_calculates_net_pay()
    {
        $expectedNetPay = 5800; // Gross (6500) - Deductions (700)
        
        $this->assertEquals($expectedNetPay, $this->payslip->net_pay);
    }

    /** @test */
    public function it_can_scope_by_period()
    {
        Payslip::factory()->create(['period' => '2024-02']);
        Payslip::factory()->create(['period' => '2024-03']);

        $marchPayslips = Payslip::byPeriod('2024-03')->get();

        $this->assertEquals(2, $marchPayslips->count());
        $this->assertEquals('2024-03', $marchPayslips->first()->period);
    }

    /** @test */
    public function it_can_scope_by_status()
    {
        Payslip::factory()->create(['status' => 'pending']);
        Payslip::factory()->create(['status' => 'generated']);

        $generatedPayslips = Payslip::byStatus('generated')->get();

        $this->assertEquals(2, $generatedPayslips->count());
        $this->assertEquals('generated', $generatedPayslips->first()->status);
    }

    /** @test */
    public function it_can_get_allowance_by_name()
    {
        $housingAllowance = $this->payslip->getAllowance('Housing');
        $transportAllowance = $this->payslip->getAllowance('Transport');

        $this->assertEquals(1000, $housingAllowance);
        $this->assertEquals(500, $transportAllowance);
    }

    /** @test */
    public function it_can_get_deduction_by_name()
    {
        $taxDeduction = $this->payslip->getDeduction('Tax');
        $insuranceDeduction = $this->payslip->getDeduction('Insurance');

        $this->assertEquals(500, $taxDeduction);
        $this->assertEquals(200, $insuranceDeduction);
    }

    /** @test */
    public function it_can_format_period()
    {
        $this->assertEquals('March 2024', $this->payslip->formatted_period);
    }

    /** @test */
    public function it_can_check_if_generated()
    {
        $this->assertTrue($this->payslip->isGenerated());
        
        $this->payslip->status = 'pending';
        $this->assertFalse($this->payslip->isGenerated());
    }

    /** @test */
    public function it_can_check_if_emailed()
    {
        $this->payslip->status = 'emailed';
        $this->assertTrue($this->payslip->isEmailed());
        
        $this->payslip->status = 'generated';
        $this->assertFalse($this->payslip->isEmailed());
    }

    /** @test */
    public function it_can_get_file_url()
    {
        $this->payslip->file_path = 'payslips/2024/03/employee_1.pdf';
        
        $expectedUrl = url('storage/payslips/2024/03/employee_1.pdf');
        $this->assertEquals($expectedUrl, $this->payslip->file_url);
    }

    /** @test */
    public function it_can_get_download_url()
    {
        $this->payslip->file_path = 'payslips/2024/03/employee_1.pdf';
        
        $expectedUrl = route('payroll.payslips.download', $this->payslip->id);
        $this->assertEquals($expectedUrl, $this->payslip->download_url);
    }

    /** @test */
    public function it_can_check_if_downloadable()
    {
        $this->payslip->file_path = 'payslips/2024/03/employee_1.pdf';
        $this->payslip->status = 'generated';
        $this->assertTrue($this->payslip->isDownloadable());
        
        $this->payslip->file_path = null;
        $this->assertFalse($this->payslip->isDownloadable());
    }

    /** @test */
    public function it_can_get_total_earnings()
    {
        $this->payslip->allowances = [
            ['name' => 'Housing', 'amount' => 1000],
            ['name' => 'Transport', 'amount' => 500],
            ['name' => 'Bonus', 'amount' => 1000],
        ];

        $expectedTotal = 7500; // Basic (5000) + All allowances (2500)
        $this->assertEquals($expectedTotal, $this->payslip->total_earnings);
    }
} 