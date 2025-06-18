<?php
namespace Modules\ProjectManagement\Actions\ProjectResources;

use Modules\ProjectManagement\Actions\ProjectResources\CreateExpense;
use Modules\ProjectManagement\Domain\Models\Project;
use Modules\ProjectManagement\Domain\Models\ProjectExpense;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class CreateExpenseTest extends TestCase
{
    use RefreshDatabase;

    protected Project $project;
    protected CreateExpense $action;

    protected function setUp(): void
    {
        parent::setUp();

        $this->project = Project::factory()->create();
        $this->action = new CreateExpense();
    }

    /** @test */
    public function it_can_create_a_new_expense()
    {
        $data = [
            'category' => 'Materials',
            'amount' => 100.50,
            'description' => 'Test expense',
            'date' => now()->format('Y-m-d'),
            'notes' => 'Test notes',
            'status' => 'pending',
        ];

        $expense = $this->action->execute($this->project, $data);

        $this->assertInstanceOf(ProjectExpense::class, $expense);
        $this->assertDatabaseHas('project_expenses', [
            'project_id' => $this->project->id,
            'category' => 'Materials',
            'amount' => 100.50,
            'description' => 'Test expense',
            'status' => 'pending',
        ]);
    }

    /** @test */
    public function it_validates_required_fields()
    {
        $this->expectException(ValidationException::class);

        $this->action->execute($this->project, []);
    }

    /** @test */
    public function it_validates_amount_is_numeric_and_positive()
    {
        $this->expectException(ValidationException::class);

        $data = [
            'category' => 'Materials',
            'amount' => -100,
            'description' => 'Test expense',
            'date' => now()->format('Y-m-d'),
            'status' => 'pending',
        ];

        $this->action->execute($this->project, $data);
    }

    /** @test */
    public function it_validates_status_is_valid()
    {
        $this->expectException(ValidationException::class);

        $data = [
            'category' => 'Materials',
            'amount' => 100.50,
            'description' => 'Test expense',
            'date' => now()->format('Y-m-d'),
            'status' => 'invalid_status',
        ];

        $this->action->execute($this->project, $data);
    }

    /** @test */
    public function it_calculates_total_cost()
    {
        $data = [
            'category' => 'Materials',
            'amount' => 100.50,
            'description' => 'Test expense',
            'date' => now()->format('Y-m-d'),
            'status' => 'pending',
        ];

        $expense = $this->action->execute($this->project, $data);

        $this->assertEquals(100.50, $expense->total_cost);
    }

    /** @test */
    public function it_updates_project_resource_costs()
    {
        $data = [
            'category' => 'Materials',
            'amount' => 100.50,
            'description' => 'Test expense',
            'date' => now()->format('Y-m-d'),
            'status' => 'pending',
        ];

        $this->action->execute($this->project, $data);

        $this->project->refresh();
        $this->assertEquals(100.50, $this->project->expense_costs);
    }
}

