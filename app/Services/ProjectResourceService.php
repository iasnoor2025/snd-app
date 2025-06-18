<?php

namespace App\Services;

use Modules\ProjectManagement\Domain\Models\Project;
use Modules\ProjectManagement\Domain\Models\ProjectMaterial;
use Modules\ProjectManagement\Domain\Models\ProjectFuel;
use Modules\ProjectManagement\Domain\Models\ProjectExpense;
use Modules\ProjectManagement\Domain\Models\ProjectEquipment;
use Modules\ProjectManagement\Domain\Models\ProjectManpower;
use Illuminate\Support\Facades\Log;

class ProjectResourceService
{
    /**
     * Store a new material resource for a project
     */
    public function storeMaterial(Project $project, array $data)
    {
        try {
            // Prepare material data with all required fields
            $materialData = [
                'project_id' => $project->id,
                'name' => $data['name'],
                'unit' => $data['unit'],
                'quantity' => $data['quantity'],
                'unit_price' => $data['unit_price'],
                'total_cost' => $data['total_cost'],
                'date_used' => $data['date_used'],
                'notes' => $data['notes'] ?? null,
                // Required fields with defaults for material type
                'job_title' => 'Material Supply',
                'start_date' => $data['date_used'],
                'daily_rate' => 0,
                'total_days' => 1,
                'usage_hours' => 0,
                'hourly_rate' => 0,
                'type' => 'material',
                'date' => $data['date_used'],
                'category' => 'material',
                'amount' => $data['total_cost'],
                'unit_cost' => $data['unit_price'],
                'status' => 'active',
                'worker_name' => 'Material Handler',
                'liters' => 0,
                'price_per_liter' => 0,
            ];

            $material = new ProjectMaterial();
            $material->fill($materialData);
            $material->save();

            return $material;
        } catch (\Exception $e) {
            Log::error('Failed to store material: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Store a new fuel resource for a project
     */
    public function storeFuel(Project $project, array $data)
    {
        try {
            // Prepare fuel data with all required fields
            $fuelData = array_merge([
                'project_id' => $project->id,
                'employee_id' => null,
                'job_title' => 'Fuel Supply',
                'start_date' => $data['date'] ?? now()->toDateString(),
                'end_date' => null,
                'daily_rate' => 0,
                'total_days' => 0,
                'total_cost' => $data['total_cost'] ?? ($data['quantity'] * $data['unit_price']),
                'notes' => $data['notes'] ?? '',
                'equipment_id' => $data['equipment_id'] ?? null,
                'usage_hours' => 0,
                'hourly_rate' => 0,
                'maintenance_cost' => 0,
                'name' => $data['name'] ?? 'Fuel',
                'unit' => $data['unit'] ?? 'liters',
                'quantity' => $data['quantity'] ?? 0,
                'unit_price' => $data['unit_price'] ?? 0,
                'date_used' => $data['date'] ?? now()->toDateString(),
                'type' => $data['type'] ?? 'fuel',
                'date' => $data['date'] ?? now()->toDateString(),
                'category' => 'fuel',
                'amount' => $data['total_cost'] ?? ($data['quantity'] * $data['unit_price']),
                'description' => $data['description'] ?? '',
                'manpower_cost' => 0,
                'equipment_cost' => 0,
                'material_cost' => 0,
                'fuel_cost' => $data['total_cost'] ?? ($data['quantity'] * $data['unit_price']),
                'expense_cost' => 0,
                'unit_cost' => $data['unit_price'] ?? 0,
                'status' => 'active',
                'equipment_type' => null,
                'equipment_number' => null,
                'operator_name' => null,
                'operator_id' => null,
                'worker_name' => 'Fuel Supplier',
                'position' => null,
                'days_worked' => null,
                'material_id' => null,
                'liters' => $data['quantity'] ?? 0,
                'price_per_liter' => $data['unit_price'] ?? 0,
                'metadata' => null,
            ], $data);

            $fuel = new ProjectFuel();
            $fuel->fill($fuelData);
            $fuel->save();

            return $fuel;
        } catch (\Exception $e) {
            Log::error('Failed to store fuel: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Store a new expense resource for a project
     */
    public function storeExpense(Project $project, array $data)
    {
        try {
            // Prepare expense data with all required fields
            $expenseData = array_merge([
                'project_id' => $project->id,
                'employee_id' => null,
                'job_title' => 'Expense',
                'start_date' => $data['date'] ?? now()->toDateString(),
                'end_date' => null,
                'daily_rate' => 0,
                'total_days' => 0,
                'total_cost' => $data['amount'] ?? 0,
                'notes' => $data['notes'] ?? '',
                'equipment_id' => null,
                'usage_hours' => 0,
                'hourly_rate' => 0,
                'maintenance_cost' => 0,
                'name' => $data['description'] ?? 'Expense',
                'unit' => '',
                'quantity' => 0,
                'unit_price' => 0,
                'date_used' => $data['date'] ?? now()->toDateString(),
                'type' => 'expense',
                'date' => $data['date'] ?? now()->toDateString(),
                'category' => $data['category'] ?? 'general',
                'amount' => $data['amount'] ?? 0,
                'description' => $data['description'] ?? '',
                'manpower_cost' => 0,
                'equipment_cost' => 0,
                'material_cost' => 0,
                'fuel_cost' => 0,
                'expense_cost' => $data['amount'] ?? 0,
                'unit_cost' => 0,
                'status' => $data['status'] ?? 'pending',
                'equipment_type' => null,
                'equipment_number' => null,
                'operator_name' => null,
                'operator_id' => null,
                'worker_name' => '',
                'position' => null,
                'days_worked' => null,
                'material_id' => null,
                'liters' => 0,
                'price_per_liter' => 0,
                'metadata' => null,
            ], $data);

            $expense = new ProjectExpense();
            $expense->fill($expenseData);
            $expense->save();

            return $expense;
        } catch (\Exception $e) {
            Log::error('Failed to store expense: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Store a new equipment resource for a project
     */
    public function storeEquipment(Project $project, array $data)
    {
        try {
            // Prepare equipment data with all required fields
            $equipmentData = array_merge([
                'project_id' => $project->id,
                'employee_id' => null,
                'job_title' => 'Equipment Operation',
                'start_date' => $data['start_date'] ?? now()->toDateString(),
                'end_date' => $data['end_date'] ?? null,
                'daily_rate' => 0,
                'total_days' => 0,
                'total_cost' => $data['total_cost'] ?? 0,
                'notes' => $data['notes'] ?? '',
                'equipment_id' => $data['equipment_id'] ?? null,
                'usage_hours' => $data['usage_hours'] ?? 0,
                'hourly_rate' => $data['hourly_rate'] ?? 0,
                'maintenance_cost' => $data['maintenance_cost'] ?? 0,
                'name' => $data['name'] ?? 'Equipment',
                'unit' => 'hours',
                'quantity' => $data['usage_hours'] ?? 0,
                'unit_price' => $data['hourly_rate'] ?? 0,
                'date_used' => $data['start_date'] ?? now()->toDateString(),
                'type' => 'equipment',
                'date' => $data['start_date'] ?? now()->toDateString(),
                'category' => 'equipment',
                'amount' => $data['total_cost'] ?? 0,
                'description' => $data['description'] ?? '',
                'manpower_cost' => 0,
                'equipment_cost' => $data['total_cost'] ?? 0,
                'material_cost' => 0,
                'fuel_cost' => 0,
                'expense_cost' => 0,
                'unit_cost' => $data['hourly_rate'] ?? 0,
                'status' => 'active',
                'equipment_type' => $data['equipment_type'] ?? null,
                'equipment_number' => $data['equipment_number'] ?? null,
                'operator_name' => $data['operator_name'] ?? null,
                'operator_id' => $data['operator_id'] ?? null,
                'worker_name' => $data['operator_name'] ?? 'Equipment Operator',
                'position' => null,
                'days_worked' => null,
                'material_id' => null,
                'liters' => 0,
                'price_per_liter' => 0,
                'metadata' => null,
            ], $data);

            $equipment = new ProjectEquipment();
            $equipment->fill($equipmentData);
            $equipment->save();

            return $equipment;
        } catch (\Exception $e) {
            Log::error('Failed to store equipment: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Store a new manpower resource for a project
     */
    public function storeManpower(Project $project, array $data)
    {
        try {
            $manpower = new ProjectManpower();
            $manpower->project_id = $project->id;
            $manpower->fill($data);
            $manpower->save();

            return $manpower;
        } catch (\Exception $e) {
            Log::error('Failed to store manpower: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Update a material resource
     */
    public function updateMaterial($material, array $data)
    {
        try {
            $material->fill($data);
            $material->save();

            return $material;
        } catch (\Exception $e) {
            Log::error('Failed to update material: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Update a fuel resource
     */
    public function updateFuel($fuel, array $data)
    {
        try {
            $fuel->fill($data);
            $fuel->save();

            return $fuel;
        } catch (\Exception $e) {
            Log::error('Failed to update fuel: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Update an expense resource
     */
    public function updateExpense($expense, array $data)
    {
        try {
            $expense->fill($data);
            $expense->save();

            return $expense;
        } catch (\Exception $e) {
            Log::error('Failed to update expense: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Delete a resource
     */
    public function deleteResource($resource)
    {
        try {
            return $resource->delete();
        } catch (\Exception $e) {
            Log::error('Failed to delete resource: ' . $e->getMessage());
            throw $e;
        }
    }
}
