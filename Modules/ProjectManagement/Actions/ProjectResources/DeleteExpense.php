<?php

namespace Modules\ProjectManagement\Actions\ProjectResources;

use Modules\ProjectManagement\Domain\Models\ProjectExpense;
use Illuminate\Support\Facades\Log;

class DeleteExpense
{
    /**
     * Execute the action to delete an expense resource.
     *
     * @param ProjectExpense $expense The expense resource to delete
     * @return bool Whether the deletion was successful
     */
    public function execute(ProjectExpense $expense): bool
    {
        try {
            $expenseId = $expense->id;
            $projectId = $expense->project_id;
            $expenseType = $expense->expense_type;
            $amount = $expense->amount;

            // Delete the expense resource
            $result = $expense->delete();

            Log::info('Expense resource deleted successfully', [
                'expense_id' => $expenseId,
                'project_id' => $projectId,
                'expense_type' => $expenseType,
                'amount' => $amount,
            ]);

            return $result;
        } catch (\Exception $e) {
            Log::error('Failed to delete expense resource', [
                'expense_id' => $expense->id,
                'project_id' => $expense->project_id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }
}
