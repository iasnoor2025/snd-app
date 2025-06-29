<?php

namespace Modules\PayrollManagement\Tests\Integration\Database;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Modules\PayrollManagement\Domain\Models\PayrollComponent;
use Modules\PayrollManagement\Domain\Models\PayrollRun;
use Modules\PayrollManagement\Repositories\PayrollComponentRepository;
use Modules\EmployeeManagement\Domain\Models\Employee;
use Illuminate\Database\QueryException;
use Carbon\Carbon;

class PayrollComponentRepositoryTest extends TestCase
{
    use RefreshDatabase;

    protected $repository;
    protected $employee;
    protected $payrollRun;

    protected function setUp(): void
    {
        parent::setUp();

        $this->repository = app(PayrollComponentRepository::class);
        $this->employee = Employee::factory()->create();
        $this->payrollRun = PayrollRun::factory()->create();
    }

    /** @test */
    public function it_can_create_salary_component()
    {
        DB::beginTransaction();

        try {
            $component = $this->repository->create([
                'name' => 'Housing Allowance',
                'type' => 'allowance',
                'calculation_rule' => 'percentage',
                'calculation_value' => 15,
                'applies_to' => 'basic_salary',
                'is_taxable' => true,
                'description' => 'Monthly housing allowance'
            ]);

            $this->assertInstanceOf(PayrollComponent::class, $component);
            $this->assertEquals('allowance', $component->type);
            $this->assertEquals(15, $component->calculation_value);

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /** @test */
    public function it_can_handle_component_validation()
    {
        $this->expectException(QueryException::class);

        $this->repository->create([
            'name' => 'Invalid Component',
            'type' => 'invalid_type', // Should fail validation
            'calculation_rule' => 'fixed'
        ]);
    }

    /** @test */
    public function it_can_handle_component_calculations()
    {
        $component = PayrollComponent::factory()->create([
            'type' => 'allowance',
            'calculation_rule' => 'percentage',
            'calculation_value' => 10
        ]);

        $result = $this->repository->calculateAmount([
            'component_id' => $component->id,
            'base_amount' => 5000,
            'employee_id' => $this->employee->id
        ]);

        $this->assertEquals(500, $result->amount); // 10% of 5000
        $this->assertTrue($result->success);
    }

    /** @test */
    public function it_can_handle_component_dependencies()
    {
        $baseComponent = PayrollComponent::factory()->create([
            'name' => 'Basic Salary',
            'type' => 'earning',
            'calculation_rule' => 'fixed'
        ]);

        $dependentComponent = $this->repository->create([
            'name' => 'Performance Bonus',
            'type' => 'bonus',
            'calculation_rule' => 'percentage',
            'calculation_value' => 20,
            'depends_on' => $baseComponent->id
        ]);

        $this->assertEquals($baseComponent->id, $dependentComponent->depends_on);
        $this->assertTrue($this->repository->validateDependencies($dependentComponent->id));
    }

    /** @test */
    public function it_can_handle_component_groups()
    {
        $group = $this->repository->createGroup([
            'name' => 'Benefits Package',
            'description' => 'Standard benefits package'
        ]);

        $components = PayrollComponent::factory()->count(3)->create([
            'group_id' => $group->id
        ]);

        $groupComponents = $this->repository->getGroupComponents($group->id);

        $this->assertCount(3, $groupComponents);
        $this->assertEquals('Benefits Package', $groupComponents[0]->group->name);
    }

    /** @test */
    public function it_can_handle_component_formulas()
    {
        $component = PayrollComponent::factory()->create([
            'name' => 'Complex Bonus',
            'type' => 'bonus',
            'calculation_rule' => 'formula',
            'formula' => '(base_salary * 0.1) + (years_of_service * 100)'
        ]);

        $result = $this->repository->evaluateFormula($component->id, [
            'base_salary' => 5000,
            'years_of_service' => 5
        ]);

        $this->assertEquals(1000, $result->amount); // (5000 * 0.1) + (5 * 100)
    }

    /** @test */
    public function it_can_handle_component_conditions()
    {
        $component = PayrollComponent::factory()->create([
            'name' => 'Tenure Bonus',
            'type' => 'bonus',
            'calculation_rule' => 'conditional',
            'conditions' => json_encode([
                'min_years_service' => 3,
                'performance_rating' => 'A'
            ])
        ]);

        $eligible = $this->repository->checkEligibility($component->id, [
            'years_of_service' => 4,
            'performance_rating' => 'A'
        ]);

        $this->assertTrue($eligible);
    }

    /** @test */
    public function it_can_handle_component_proration()
    {
        $component = PayrollComponent::factory()->create([
            'name' => 'Monthly Allowance',
            'type' => 'allowance',
            'calculation_rule' => 'fixed',
            'calculation_value' => 1000,
            'is_prorated' => true
        ]);

        $result = $this->repository->calculateProration($component->id, [
            'start_date' => Carbon::now()->startOfMonth()->addDays(15),
            'end_date' => Carbon::now()->endOfMonth()
        ]);

        $this->assertEquals(500, $result->prorated_amount); // Half month
    }

    /** @test */
    public function it_can_handle_component_tax_rules()
    {
        $component = PayrollComponent::factory()->create([
            'name' => 'Special Allowance',
            'type' => 'allowance',
            'is_taxable' => true,
            'tax_category' => 'benefit_in_kind'
        ]);

        $taxRules = $this->repository->getTaxRules($component->id);

        $this->assertTrue($taxRules->is_taxable);
        $this->assertEquals('benefit_in_kind', $taxRules->tax_category);
    }

    /** @test */
    public function it_can_handle_component_templates()
    {
        $template = $this->repository->createTemplate([
            'name' => 'Standard Package',
            'description' => 'Default component package'
        ]);

        $components = PayrollComponent::factory()->count(5)->create([
            'template_id' => $template->id
        ]);

        $applied = $this->repository->applyTemplate($template->id, $this->employee->id);

        $this->assertTrue($applied->success);
        $this->assertCount(5, $applied->components);
    }

    /** @test */
    public function it_can_handle_component_history()
    {
        $component = PayrollComponent::factory()->create();

        // Create some history entries
        for ($i = 0; $i < 3; $i++) {
            $this->repository->updateComponent($component->id, [
                'calculation_value' => 1000 + ($i * 100),
                'effective_date' => Carbon::now()->addMonths($i)
            ]);
        }

        $history = $this->repository->getHistory($component->id);

        $this->assertCount(3, $history);
        $this->assertTrue($history[0]->effective_date > $history[1]->effective_date);
    }

    /** @test */
    public function it_can_handle_component_bulk_updates()
    {
        $components = PayrollComponent::factory()->count(5)->create([
            'type' => 'allowance',
            'calculation_value' => 1000
        ]);

        $result = $this->repository->bulkUpdate($components->pluck('id')->toArray(), [
            'calculation_value' => 1200,
            'effective_date' => Carbon::now()
        ]);

        $this->assertEquals(5, $result->updated_count);
        $this->assertEquals(1200, PayrollComponent::find($components[0]->id)->calculation_value);
    }

    /** @test */
    public function it_can_handle_component_validation_rules()
    {
        $component = PayrollComponent::factory()->create([
            'name' => 'Performance Bonus',
            'validation_rules' => json_encode([
                'max_amount' => 10000,
                'requires_approval' => true,
                'approval_threshold' => 5000
            ])
        ]);

        $validation = $this->repository->validateAmount($component->id, 6000);

        $this->assertTrue($validation->requires_approval);
        $this->assertTrue($validation->is_valid);
    }

    /** @test */
    public function it_can_handle_component_reporting()
    {
        // Create test data
        PayrollComponent::factory()->count(10)->create([
            'type' => 'allowance'
        ]);

        PayrollComponent::factory()->count(5)->create([
            'type' => 'deduction'
        ]);

        $report = $this->repository->generateReport([
            'group_by' => 'type',
            'include_inactive' => false
        ]);

        $this->assertEquals(10, $report->allowances_count);
        $this->assertEquals(5, $report->deductions_count);
    }

    /** @test */
    public function it_can_handle_component_audit_trail()
    {
        $component = PayrollComponent::factory()->create();

        $this->repository->logAudit($component->id, [
            'action' => 'update',
            'field' => 'calculation_value',
            'old_value' => 1000,
            'new_value' => 1200,
            'user_id' => 1
        ]);

        $audit = $this->repository->getAuditTrail($component->id);

        $this->assertCount(1, $audit);
        $this->assertEquals('update', $audit[0]->action);
    }
}
