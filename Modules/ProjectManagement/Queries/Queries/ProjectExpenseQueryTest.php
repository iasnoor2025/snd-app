<?php
namespace Modules\ProjectManagement\Queries\Queries;

use Modules\ProjectManagement\Domain\Models\Project;
use Modules\ProjectManagement\Domain\Models\ProjectExpense;
use App\Queries\ProjectExpenseQuery;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectExpenseQueryTest extends TestCase
{
    use RefreshDatabase;
use protected Project $project;
    protected ProjectExpenseQuery $query;

    protected function setUp(): void
    {
        parent::setUp();

        $this->project = Project::factory()->create();
        $this->query = new ProjectExpenseQuery($this->project);
    }

    /** @test */
    public function it_can_filter_by_status()
    {
        $pendingExpense = ProjectExpense::factory()->create([
            'project_id' => $this->project->id,
            'status' => 'pending',
        ]);

        $approvedExpense = ProjectExpense::factory()->create([
            'project_id' => $this->project->id,
            'status' => 'approved',
        ]);

        $results = $this->query->filter(['status' => 'pending'])->get();

        $this->assertCount(1, $results);
        $this->assertEquals($pendingExpense->id, $results->first()->id);
    }

    /** @test */
    public function it_can_filter_by_date_range()
    {
        $oldExpense = ProjectExpense::factory()->create([
            'project_id' => $this->project->id,
            'date' => now()->subDays(10),
        ]);

        $recentExpense = ProjectExpense::factory()->create([
            'project_id' => $this->project->id,
            'date' => now()->subDays(2),
        ]);

        $results = $this->query->filter([
            'start_date' => now()->subDays(5)->format('Y-m-d'),
            'end_date' => now()->format('Y-m-d'),
        ])->get();

        $this->assertCount(1, $results);
        $this->assertEquals($recentExpense->id, $results->first()->id);
    }

    /** @test */
    public function it_can_search_by_description()
    {
        $expense1 = ProjectExpense::factory()->create([
            'project_id' => $this->project->id,
            'description' => 'Office supplies',
        ]);

        $expense2 = ProjectExpense::factory()->create([
            'project_id' => $this->project->id,
            'description' => 'Travel expenses',
        ]);

        $results = $this->query->search('office')->get();

        $this->assertCount(1, $results);
        $this->assertEquals($expense1->id, $results->first()->id);
    }

    /** @test */
    public function it_can_sort_by_amount()
    {
        $expense1 = ProjectExpense::factory()->create([
            'project_id' => $this->project->id,
            'amount' => 100.00,
        ]);

        $expense2 = ProjectExpense::factory()->create([
            'project_id' => $this->project->id,
            'amount' => 200.00,
        ]);

        $results = $this->query->sort('amount', 'desc')->get();

        $this->assertEquals($expense2->id, $results->first()->id);
        $this->assertEquals($expense1->id, $results->last()->id);
    }

    /** @test */
    public function it_can_paginate_results()
    {
        ProjectExpense::factory()->count(15)->create([
            'project_id' => $this->project->id
        ]);

        $results = $this->query->paginate(10);

        $this->assertCount(10, $results->items());
        $this->assertEquals(15, $results->total());
    }
}


