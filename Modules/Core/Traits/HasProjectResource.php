<?php

namespace Modules\Core\Traits;

trait HasProjectResource
{
    /**
     * Calculate the total cost for the resource.
     * This method should be implemented by the using class.
     */
    public function calculateTotalCost(): float
    {
        // Default implementation - override in the model using this trait
        $quantity = $this->quantity ?? 1;
        $unitCost = $this->unit_cost ?? $this->cost ?? 0;
        
        return (float) ($quantity * $unitCost);
    }

    /**
     * Get the resource utilization percentage
     */
    public function getUtilizationPercentage(): float
    {
        $allocatedAmount = $this->allocated_amount ?? 0;
        $totalAmount = $this->total_amount ?? $this->calculateTotalCost();
        
        if ($totalAmount <= 0) {
            return 0;
        }
        
        return round(($allocatedAmount / $totalAmount) * 100, 2);
    }

    /**
     * Check if the resource is over budget
     */
    public function isOverBudget(): bool
    {
        $spentAmount = $this->spent_amount ?? $this->allocated_amount ?? 0;
        $budgetAmount = $this->budget_amount ?? $this->total_amount ?? $this->calculateTotalCost();
        
        return $spentAmount > $budgetAmount;
    }

    /**
     * Get remaining budget for the resource
     */
    public function getRemainingBudget(): float
    {
        $spentAmount = $this->spent_amount ?? $this->allocated_amount ?? 0;
        $budgetAmount = $this->budget_amount ?? $this->total_amount ?? $this->calculateTotalCost();
        
        return max(0, $budgetAmount - $spentAmount);
    }
}
