<?php

namespace Modules\PayrollManagement\Tests\Unit\Services;

use Tests\TestCase;
use Modules\PayrollManagement\Services\PayslipGenerationService;
use Modules\Core\Services\PdfGenerationService;
use Modules\Reporting\Services\ReportExportService;
use Modules\EmployeeManagement\Services\EmployeeService;
use Modules\EmployeeManagement\Models\Employee;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Queue;
use Mockery;
use Carbon\Carbon;

class PayslipGenerationServiceTest extends TestCase
{
    protected PayslipGenerationService $service;
    protected PdfGenerationService $pdfService;
    protected ReportExportService $reportService;
    protected EmployeeService $employeeService;
    protected Employee $employee;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->pdfService = Mockery::mock(PdfGenerationService::class);
        $this->reportService = Mockery::mock(ReportExportService::class);
        $this->employeeService = Mockery::mock(EmployeeService::class);
        
        $this->service = new PayslipGenerationService(
            $this->pdfService,
            $this->reportService,
            $this->employeeService
        );
        
        $this->employee = new Employee([
            'id' => 1,
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john.doe@example.com',
            'employee_id' => 'EMP001',
            'department' => 'IT',
            'position' => 'Developer',
        ]);
        
        // Create necessary directories
        Storage::makeDirectory('temp/tests');
        Storage::makeDirectory('payslips');
    }

    protected function tearDown(): void
    {
        // Cleanup test files
        Storage::deleteDirectory('temp/tests');
        Storage::deleteDirectory('payslips/tests');
        
        Mockery::close();
        parent::tearDown();
    }

    /** @test */
    public function it_can_generate_single_payslip()
    {
        $period = '2024-03';
        $data = [
            'basic_salary' => 5000,
            'allowances' => [
                ['name' => 'Housing', 'amount' => 1000],
            ],
            'deductions' => [
                ['name' => 'Tax', 'amount' => 500],
            ],
        ];

        $this->employeeService
            ->shouldReceive('findById')
            ->with(1)
            ->andReturn($this->employee);

        $this->pdfService
            ->shouldReceive('generateFromView')
            ->once()
            ->withArgs(function ($template, $viewData) {
                return $template === 'payroll::pdfs.payslips.default' &&
                       isset($viewData['employee']) &&
                       isset($viewData['period']);
            })
            ->andReturn('temp/test-payslip.pdf');

        $path = $this->service->generatePayslip(1, $period, $data);

        $this->assertNotEmpty($path);
        $this->assertStringEndsWith('.pdf', $path);
    }

    /** @test */
    public function it_can_generate_bulk_payslips()
    {
        $period = '2024-03';
        $employeeIds = [1, 2];
        $data = [
            1 => ['basic_salary' => 5000],
            2 => ['basic_salary' => 6000],
        ];

        $this->employeeService
            ->shouldReceive('findById')
            ->twice()
            ->andReturn($this->employee);

        $this->pdfService
            ->shouldReceive('generateFromView')
            ->twice()
            ->andReturn('temp/payslip1.pdf', 'temp/payslip2.pdf');

        $paths = $this->service->generateBulkPayslips($employeeIds, $period, $data);

        $this->assertIsArray($paths);
        $this->assertCount(1, $paths); // Combined into one file
    }

    /** @test */
    public function it_stores_payslips_permanently()
    {
        $period = '2024-03';
        $data = ['basic_salary' => 5000];
        
        $this->employeeService
            ->shouldReceive('findById')
            ->with(1)
            ->andReturn($this->employee);

        $this->pdfService
            ->shouldReceive('generateFromView')
            ->once()
            ->andReturn('temp/test-payslip.pdf');

        $path = $this->service->generatePayslip(1, $period, $data, ['store_permanently' => true]);

        $this->assertStringStartsWith('payslips/', $path);
    }

    /** @test */
    public function it_emails_payslips_to_employees()
    {
        Queue::fake();

        $period = '2024-03';
        $data = ['basic_salary' => 5000];
        
        $this->employeeService
            ->shouldReceive('findById')
            ->with(1)
            ->andReturn($this->employee);

        $this->pdfService
            ->shouldReceive('generateFromView')
            ->once()
            ->andReturn('temp/test-payslip.pdf');

        $this->service->generatePayslip(1, $period, $data, ['email_employees' => true]);

        Queue::assertPushed(\Modules\PayrollManagement\Jobs\SendPayslipEmail::class);
    }

    /** @test */
    public function it_calculates_totals_correctly()
    {
        $period = '2024-03';
        $data = [
            'basic_salary' => 5000,
            'allowances' => [
                ['name' => 'Housing', 'amount' => 1000],
                ['name' => 'Transport', 'amount' => 500],
            ],
            'deductions' => [
                ['name' => 'Tax', 'amount' => 500],
                ['name' => 'Insurance', 'amount' => 200],
            ],
        ];

        $this->employeeService
            ->shouldReceive('findById')
            ->with(1)
            ->andReturn($this->employee);

        $this->pdfService
            ->shouldReceive('generateFromView')
            ->once()
            ->withArgs(function ($template, $viewData) {
                return $viewData['totals']['gross_pay'] === 6500 && // Basic + Allowances
                       $viewData['totals']['total_deductions'] === 700 && // Total Deductions
                       $viewData['totals']['net_pay'] === 5800; // Gross - Deductions
            })
            ->andReturn('temp/test-payslip.pdf');

        $this->service->generatePayslip(1, $period, $data);
    }

    /** @test */
    public function it_handles_missing_employee_email_gracefully()
    {
        $employeeWithoutEmail = new Employee([
            'id' => 2,
            'first_name' => 'Jane',
            'last_name' => 'Doe',
            'employee_id' => 'EMP002',
        ]);

        $period = '2024-03';
        $data = ['basic_salary' => 5000];
        
        $this->employeeService
            ->shouldReceive('findById')
            ->with(2)
            ->andReturn($employeeWithoutEmail);

        $this->pdfService
            ->shouldReceive('generateFromView')
            ->once()
            ->andReturn('temp/test-payslip.pdf');

        // Should not throw an exception
        $this->service->generatePayslip(2, $period, $data, ['email_employees' => true]);
    }

    /** @test */
    public function it_provides_available_templates()
    {
        $templates = $this->service->getAvailableTemplates();

        $this->assertIsObject($templates);
        $this->assertNotEmpty($templates);
        $this->assertArrayHasKey('default', $templates->toArray());
    }

    /** @test */
    public function it_handles_errors_in_bulk_generation()
    {
        $period = '2024-03';
        $employeeIds = [1, 2];
        
        $this->employeeService
            ->shouldReceive('findById')
            ->twice()
            ->andThrow(new \Exception('Employee not found'));

        $paths = $this->service->generateBulkPayslips($employeeIds, $period);

        $this->assertEmpty($paths);
    }
} 