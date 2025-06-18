<?php
namespace Modules\ProjectManagement\Actions\ProjectResources;

use Modules\ProjectManagement\Actions\ProjectResources\UpdateExpense;
use Modules\ProjectManagement\Domain\Models\Project;
use Modules\ProjectManagement\Domain\Models\ProjectExpense;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class UpdateExpenseTest extends TestCase
{
    use RefreshDatabase;

    protected Project $project;
    protected ProjectExpense $expense;
    protected UpdateExpense $action;

    protected function setUp(): void
    {
        parent::setUp();

        $this->project = Project::factory()->create();
        $this->expense = ProjectExpense::factory()->create([
            'project_id' => $this->project->id,
            'amount' => 100.50,
        ]);
        $this->action = new UpdateExpense();
    }

    /** @test */
    public function it_can_update_an_existing_expense()
    {
        $data = [
            'category' => 'Updated Category',
            'amount' => 200.75,
            'description' => 'Updated description',
            'date' => now()->addDay()->format('Y-m-d'),
            'notes' => 'Updated notes',
            'status' => 'approved',
        ];

        $updatedExpense = $this->action->execute($this->expense, $data);

        $this->assertInstanceOf(ProjectExpense::class, $updatedExpense);
        $this->assertDatabaseHas('project_expenses', [
            'id' => $this->expense->id,
            'category' => 'Updated Category',
            'amount' => 200.75,
            'description' => 'Updated description',
            'status' => 'approved',
        ]);
    }

    /** @test */
    public function it_validates_amount_is_numeric_and_positive()
    {
        $this->expectException(ValidationException::class);

        $data = [
            'amount' => -100
        ];

        $this->action->execute($this->expense, $data);
    }

    /** @test */
    public function it_validates_status_is_valid()
    {
        $this->expectException(ValidationException::class);

        $data = [
            'status' => 'invalid_status'
        ];

        $this->action->execute($this->expense, $data);
    }

    /** @test */
    public function it_updates_total_cost_when_amount_changes()
    {
        $data = [
            'amount' => 200.75
        ];

        $updatedExpense = $this->action->execute($this->expense, $data);

        $this->assertEquals(200.75, $updatedExpense->total_cost);
    }

    /** @test */
    public function it_updates_project_resource_costs()
    {
        $data = [
            'amount' => 200.75
        ];

        $this->action->execute($this->expense, $data);

        $this->project->refresh();
        $this->assertEquals(200.75, $this->project->expense_costs);
    }

    /** @test */
    public function it_handles_partial_updates()
    {
        $data = [
            'description' => 'Updated description only'
        ];

        $updatedExpense = $this->action->execute($this->expense, $data);

        $this->assertEquals('Updated description only', $updatedExpense->description);
        $this->assertEquals(100.50, $updatedExpense->amount); // Original amount unchanged
    }
}


