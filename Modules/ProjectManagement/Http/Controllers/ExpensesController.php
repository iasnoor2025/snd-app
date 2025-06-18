<?php
namespace Modules\ProjectManagement\Http\Controllers;

use Modules\ProjectManagement\Actions\ProjectResources\CreateExpense;
use Modules\ProjectManagement\Actions\ProjectResources\UpdateExpense;
use Modules\ProjectManagement\Actions\ProjectResources\DeleteExpense;
use App\Http\Controllers\Controller;
use Modules\ProjectManagement\Domain\Models\Project;
use Modules\ProjectManagement\Domain\Models\ProjectExpense;
use App\Queries\ProjectExpenseQuery;
use Illuminate\Http\Request;

class ExpensesController extends Controller
{
    protected $createExpense;
    protected $updateExpense;
    protected $deleteExpense;
    protected $expenseQuery;

    public function __construct(
        CreateExpense $createExpense,
        UpdateExpense $updateExpense,
        DeleteExpense $deleteExpense,
        ProjectExpenseQuery $expenseQuery
    ) {
        $this->createExpense = $createExpense;
        $this->updateExpense = $updateExpense;
        $this->deleteExpense = $deleteExpense;
        $this->expenseQuery = $expenseQuery;
    }

    /**
     * Display a listing of the expense resources.
     */
    public function index(Request $request, Project $project)
    {
        $this->authorize('viewAny', [ProjectExpense::class, $project]);

        $expenses = $this->expenseQuery->forProject($project)
            ->filter($request->all())
            ->paginate(10);

        if ($request->wantsJson()) {
            return response()->json([
                'data' => $expenses
            ]);
        }

        return inertia('Projects/Resources/Tabs/ExpensesTab', [
            'project' => $project,
            'expenses' => $expenses,
        ]);
    }

    /**
     * Store a newly created expense resource.
     */
    public function store(Request $request, Project $project)
    {
        $this->authorize('create', [ProjectExpense::class, $project]);

        try {
            $expense = $this->createExpense->execute($project, $request->all());

            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Expense resource created successfully',
                    'resource' => $expense
                ], 201);
            }

            return redirect()->back()
                ->with('success', 'Expense resource added successfully.');
        } catch (\Exception $e) {
            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Failed to create expense resource',
                    'error' => $e->getMessage()
                ], 422);
            }

            return redirect()->back()
                ->withInput()
                ->withErrors(['error' => 'Failed to create expense resource: ' . $e->getMessage()]);
        }
    }

    /**
     * Update the specified expense resource.
     */
    public function update(Request $request, Project $project, ProjectExpense $expense)
    {
        $this->authorize('update', [$expense, $project]);

        try {
            $updatedExpense = $this->updateExpense->execute($expense, $request->all());

            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Expense resource updated successfully',
                    'resource' => $updatedExpense
                ]);
            }

            return redirect()->back()
                ->with('success', 'Expense resource updated successfully.');
        } catch (\Exception $e) {
            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Failed to update expense resource',
                    'error' => $e->getMessage()
                ], 422);
            }

            return redirect()->back()
                ->withInput()
                ->withErrors(['error' => 'Failed to update expense resource: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified expense resource.
     */
    public function destroy(Request $request, Project $project, ProjectExpense $expense)
    {
        $this->authorize('delete', [$expense, $project]);

        try {
            $this->deleteExpense->execute($expense);

            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Expense resource deleted successfully'
                ]);
            }

            return redirect()->back()
                ->with('success', 'Expense resource deleted successfully.');
        } catch (\Exception $e) {
            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Failed to delete expense resource',
                    'error' => $e->getMessage()
                ], 422);
            }

            return redirect()->back()
                ->withErrors(['error' => 'Failed to delete expense resource: ' . $e->getMessage()]);
        }
    }
}


