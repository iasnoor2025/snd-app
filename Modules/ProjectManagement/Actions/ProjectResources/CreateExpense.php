<?php

namespace Modules\ProjectManagement\Actions\ProjectResources;

use Modules\ProjectManagement\Domain\Models\Project;
use Modules\ProjectManagement\Domain\Models\ProjectExpense;
use Illuminate\Support\Facades\Log;

class CreateExpense
{
    /**
     * Execute the action to create a new expense resource.
     *
     * @param Project $project The project to add expense to
     * @param array $data The validated data for creating the expense resource
     * @return ProjectExpense The created expense resource
     */
    public function execute(Project $project, array $data): ProjectExpense
    {
        try {
            // Create the expense resource
            $expense = $project->expenses()->create([
                'expense_type' => $data['expense_type'],
                'description' => $data['description'],
                'date' => $data['date'],
                'amount' => $data['amount'],
                'receipt_number' => $data['receipt_number'] ?? null,
                'notes' => $data['notes'] ?? null,
            ]);

            Log::info('Expense resource created successfully', [
                'project_id' => $project->id,
                'expense_id' => $expense->id,
                'expense_type' => $expense->expense_type,
                'amount' => $expense->amount,
            ]);

            return $expense;
        } catch (\Exception $e) {
            Log::error('Failed to create expense resource', [
                'project_id' => $project->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }
}
