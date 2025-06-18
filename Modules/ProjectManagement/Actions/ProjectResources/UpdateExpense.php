<?php

namespace Modules\ProjectManagement\Actions\ProjectResources;

use Modules\ProjectManagement\Domain\Models\ProjectExpense;
use Illuminate\Support\Facades\Log;

class UpdateExpense
{
    /**
     * Execute the action to update an existing expense resource.
     *
     * @param ProjectExpense $expense The expense resource to update
     * @param array $data The validated data for updating the expense resource
     * @return ProjectExpense The updated expense resource
     */
    public function execute(ProjectExpense $expense, array $data): ProjectExpense
    {
        try {
            // Update the expense resource
            $expense->update([
                'expense_type' => $data['expense_type'],
                'description' => $data['description'],
                'date' => $data['date'],
                'amount' => $data['amount'],
                'receipt_number' => $data['receipt_number'] ?? null,
                'notes' => $data['notes'] ?? null,
            ]);

            Log::info('Expense resource updated successfully', [
                'expense_id' => $expense->id,
                'project_id' => $expense->project_id,
                'expense_type' => $expense->expense_type,
                'amount' => $expense->amount,
            ]);

            return $expense;
        } catch (\Exception $e) {
            Log::error('Failed to update expense resource', [
                'expense_id' => $expense->id,
                'project_id' => $expense->project_id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }
}
