<?php

namespace Modules\PayrollManagement\Tests\Integration\Database;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Modules\PayrollManagement\Domain\Models\PayrollRun;
use Modules\PayrollManagement\Domain\Models\PayrollComponent;
use Modules\PayrollManagement\Repositories\PayrollRunRepository;
use Modules\EmployeeManagement\Domain\Models\Employee;
use Illuminate\Database\QueryException;
use Carbon\Carbon;

class PayrollRunRepositoryTest extends TestCase
{
    use RefreshDatabase;

    protected $repository;
    protected $employee;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->repository = app(PayrollRunRepository::class);
        $this->employee = Employee::factory()->create();
    }

    /** @test */
    public function it_can_create_payroll_run_with_transaction()
    {
        DB::beginTransaction();

        try {
            $payrollRun = $this->repository->create([
                'period_start' => Carbon::now()->startOfMonth(),
                'period_end' => Carbon::now()->endOfMonth(),
                'status' => 'draft',
                'type' => 'regular',
                'description' => 'March 2024 Payroll'
            ]);

            $this->assertInstanceOf(PayrollRun::class, $payrollRun);
            $this->assertEquals('draft', $payrollRun->status);

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /** @test */
    public function it_can_handle_payroll_components()
    {
        $payrollRun = PayrollRun::factory()->create();
        
        $component = PayrollComponent::factory()->create([
            'name' => 'Basic Salary',
            'type' => 'earning',
            'calculation_rule' => 'fixed'
        ]);

        $result = $this->repository->addComponent($payrollRun->id, [
            'component_id' => $component->id,
            'amount' => 5000,
            'currency' => 'USD'
        ]);

        $this->assertTrue($result->success);
        $this->assertEquals(5000, $result->amount);
    }

    /** @test */
    public function it_can_calculate_payroll()
    {
        $payrollRun = PayrollRun::factory()->create();
        
        // Add employees to payroll run
        $employees = Employee::factory()->count(3)->create();
        
        foreach ($employees as $employee) {
            $this->repository->addEmployee($payrollRun->id, $employee->id, [
                'basic_salary' => 5000,
                'allowances' => 1000,
                'deductions' => 500
            ]);
        }

        $calculation = $this->repository->calculatePayroll($payrollRun->id);

        $this->assertEquals(16500, $calculation->total_gross); // (5000 + 1000 - 500) * 3
        $this->assertCount(3, $calculation->employee_calculations);
    }

    /** @test */
    public function it_can_handle_approval_workflow()
    {
        $payrollRun = PayrollRun::factory()->create([
            'status' => 'draft'
        ]);

        // Submit for approval
        $submitted = $this->repository->submitForApproval($payrollRun->id, [
            'submitted_by' => 1,
            'notes' => 'Ready for review'
        ]);

        $this->assertEquals('pending_approval', $submitted->status);

        // Approve payroll run
        $approved = $this->repository->approve($payrollRun->id, [
            'approved_by' => 2,
            'approval_notes' => 'Calculations verified'
        ]);

        $this->assertEquals('approved', $approved->status);
    }

    /** @test */
    public function it_can_handle_payroll_locking()
    {
        $payrollRun = PayrollRun::factory()->create([
            'status' => 'approved'
        ]);

        $locked = $this->repository->lockPayroll($payrollRun->id, [
            'locked_by' => 1,
            'lock_reason' => 'Final version'
        ]);

        $this->assertTrue($locked->is_locked);
        $this->assertNotNull($locked->locked_at);

        // Attempt to modify locked payroll
        $this->expectException(\Exception::class);
        $this->repository->updateCalculations($payrollRun->id, [
            'employee_id' => $this->employee->id,
            'amount' => 6000
        ]);
    }

    /** @test */
    public function it_can_handle_payroll_reversals()
    {
        $payrollRun = PayrollRun::factory()->create([
            'status' => 'processed'
        ]);

        $reversal = $this->repository->createReversal($payrollRun->id, [
            'reason' => 'Calculation error',
            'initiated_by' => 1,
            'affected_employees' => [$this->employee->id]
        ]);

        $this->assertTrue($reversal->success);
        $this->assertEquals('reversed', $payrollRun->fresh()->status);
    }

    /** @test */
    public function it_can_handle_payroll_adjustments()
    {
        $payrollRun = PayrollRun::factory()->create();

        $adjustment = $this->repository->createAdjustment($payrollRun->id, [
            'employee_id' => $this->employee->id,
            'type' => 'bonus',
            'amount' => 1000,
            'reason' => 'Performance bonus',
            'approved_by' => 1
        ]);

        $this->assertTrue($adjustment->success);
        $this->assertEquals(1000, $adjustment->amount);
    }

    /** @test */
    public function it_can_handle_tax_calculations()
    {
        $payrollRun = PayrollRun::factory()->create();

        $this->repository->addEmployee($payrollRun->id, $this->employee->id, [
            'basic_salary' => 5000,
            'taxable_benefits' => 1000
        ]);

        $taxCalculation = $this->repository->calculateTax($payrollRun->id, $this->employee->id);

        $this->assertNotNull($taxCalculation->tax_amount);
        $this->assertNotNull($taxCalculation->tax_breakdown);
    }

    /** @test */
    public function it_can_handle_deduction_rules()
    {
        $payrollRun = PayrollRun::factory()->create();

        $deductionRule = $this->repository->createDeductionRule([
            'name' => 'Health Insurance',
            'type' => 'percentage',
            'value' => 2.5,
            'applies_to' => 'basic_salary'
        ]);

        $calculation = $this->repository->applyDeductions($payrollRun->id, $this->employee->id, [
            'basic_salary' => 5000,
            'rules' => [$deductionRule->id]
        ]);

        $this->assertEquals(125, $calculation->total_deductions); // 2.5% of 5000
    }

    /** @test */
    public function it_can_handle_payroll_reports()
    {
        $payrollRun = PayrollRun::factory()->create();
        
        // Add some test data
        Employee::factory()->count(5)->create()->each(function ($employee) use ($payrollRun) {
            $this->repository->addEmployee($payrollRun->id, $employee->id, [
                'basic_salary' => 5000,
                'allowances' => 1000,
                'deductions' => 500
            ]);
        });

        $report = $this->repository->generateReport($payrollRun->id, [
            'type' => 'summary',
            'format' => 'pdf'
        ]);

        $this->assertTrue($report->success);
        $this->assertNotNull($report->file_path);
    }

    /** @test */
    public function it_can_handle_payroll_auditing()
    {
        $payrollRun = PayrollRun::factory()->create();

        $this->repository->logAuditEvent($payrollRun->id, [
            'action' => 'calculation_modified',
            'user_id' => 1,
            'details' => 'Updated basic salary calculation',
            'old_value' => 5000,
            'new_value' => 5500
        ]);

        $audit = $this->repository->getAuditTrail($payrollRun->id);
        
        $this->assertCount(1, $audit);
        $this->assertEquals('calculation_modified', $audit[0]->action);
    }

    /** @test */
    public function it_can_handle_payroll_statistics()
    {
        $payrollRun = PayrollRun::factory()->create();
        
        // Add test data
        Employee::factory()->count(10)->create()->each(function ($employee) use ($payrollRun) {
            $this->repository->addEmployee($payrollRun->id, $employee->id, [
                'basic_salary' => rand(3000, 7000),
                'allowances' => rand(500, 1500),
                'deductions' => rand(200, 800)
            ]);
        });

        $stats = $this->repository->getStatistics($payrollRun->id);

        $this->assertNotNull($stats->total_payroll);
        $this->assertNotNull($stats->average_salary);
        $this->assertNotNull($stats->total_deductions);
        $this->assertNotNull($stats->employee_count);
    }

    /** @test */
    public function it_can_handle_compliance_checks()
    {
        $payrollRun = PayrollRun::factory()->create();

        $compliance = $this->repository->checkCompliance($payrollRun->id, [
            'minimum_wage' => 3000,
            'maximum_deductions_percentage' => 30,
            'tax_regulations' => true
        ]);

        $this->assertTrue($compliance->is_compliant);
        $this->assertEmpty($compliance->violations);
    }

    /** @test */
    public function it_can_handle_batch_processing()
    {
        $payrollRuns = PayrollRun::factory()->count(3)->create([
            'status' => 'approved'
        ]);

        $result = $this->repository->processBatch($payrollRuns->pluck('id')->toArray(), [
            'action' => 'finalize',
            'processed_by' => 1
        ]);

        $this->assertEquals(3, $result->processed_count);
        $this->assertEquals(3, PayrollRun::where('status', 'processed')->count());
    }
} 