<?php
namespace Modules\ProjectManagement\Actions\ProjectResources;

use Modules\ProjectManagement\Actions\ProjectResources\DeleteExpense;
use Modules\ProjectManagement\Domain\Models\Project;
use Modules\ProjectManagement\Domain\Models\ProjectExpense;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DeleteExpenseTest extends TestCase
{
    use RefreshDatabase;

    protected Project $project;
    protected ProjectExpense $expense;
    protected DeleteExpense $action;

    protected function setUp(): void
    {
        parent::setUp();

        $this->project = Project::factory()->create();
        $this->expense = ProjectExpense::factory()->create([
            'project_id' => $this->project->id,
            'amount' => 100.50,
        ]);
        $this->action = new DeleteExpense();
    }

    /** @test */
    public function it_can_delete_an_expense()
    {
        $this->action->handle($this->expense);

        $this->assertDatabaseMissing('project_expenses', [
            'id' => $this->expense->id
        ]);
    }

    /** @test */
    public function it_updates_project_resource_costs_after_deletion()
    {
        // Create multiple expenses to test cost recalculation
        $expense2 = ProjectExpense::factory()->create([
            'project_id' => $this->project->id,
            'amount' => 50.25,
        ]);

        $this->action->handle($this->expense);

        $this->project->refresh();
        $this->assertEquals(50.25, $this->project->expense_costs);
    }

    /** @test */
    public function it_handles_deletion_of_last_expense()
    {
        $this->action->handle($this->expense);

        $this->project->refresh();
        $this->assertEquals(0, $this->project->expense_costs);
    }

    /** @test */
    public function it_soft_deletes_the_expense()
    {
        $this->action->handle($this->expense);

        $this->assertSoftDeleted('project_expenses', [
            'id' => $this->expense->id
        ]);
    }
}


