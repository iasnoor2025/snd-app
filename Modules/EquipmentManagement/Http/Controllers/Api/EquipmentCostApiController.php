<?php

namespace Modules\EquipmentManagement\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Modules\EquipmentManagement\Services\EquipmentCostService;

class EquipmentCostApiController extends Controller
{
    protected $equipmentCostService;

    public function __construct(EquipmentCostService $equipmentCostService)
    {
        $this->equipmentCostService = $equipmentCostService;
    }

    /**
     * Display a listing of equipment costs.
     */
    public function index(Request $request): JsonResponse
    {
        $costs = $this->equipmentCostService->getEquipmentCosts($request->all());

        return response()->json([
            'success' => true,
            'data' => $costs,
            'message' => 'Equipment costs retrieved successfully'
        ]);
    }

    /**
     * Store a newly created equipment cost record.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'equipment_id' => 'required|exists:equipment,id',
            'cost_type' => 'required|string|in:purchase,maintenance,repair,fuel,insurance,depreciation,other',
            'amount' => 'required|numeric|min:0',
            'currency' => 'required|string|max:3',
            'date' => 'required|date',
            'description' => 'nullable|string|max:1000',
            'category' => 'nullable|string|max:100',
            'vendor_id' => 'nullable|exists:vendors,id',
            'invoice_number' => 'nullable|string|max:100',
            'receipt_url' => 'nullable|url',
            'is_recurring' => 'boolean',
            'recurring_frequency' => 'nullable|string|in:daily,weekly,monthly,quarterly,yearly',
            'metadata' => 'nullable|array'
        ]);

        $cost = $this->equipmentCostService->createEquipmentCost($validated);

        return response()->json([
            'success' => true,
            'data' => $cost,
            'message' => 'Equipment cost record created successfully'
        ], 201);
    }

    /**
     * Display the specified equipment cost.
     */
    public function show(string $id): JsonResponse
    {
        $cost = $this->equipmentCostService->getEquipmentCost($id);

        if (!$cost) {
            return response()->json([
                'success' => false,
                'message' => 'Equipment cost record not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $cost,
            'message' => 'Equipment cost record retrieved successfully'
        ]);
    }

    /**
     * Update the specified equipment cost.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'equipment_id' => 'sometimes|exists:equipment,id',
            'cost_type' => 'sometimes|string|in:purchase,maintenance,repair,fuel,insurance,depreciation,other',
            'amount' => 'sometimes|numeric|min:0',
            'currency' => 'sometimes|string|max:3',
            'date' => 'sometimes|date',
            'description' => 'nullable|string|max:1000',
            'category' => 'nullable|string|max:100',
            'vendor_id' => 'nullable|exists:vendors,id',
            'invoice_number' => 'nullable|string|max:100',
            'receipt_url' => 'nullable|url',
            'is_recurring' => 'boolean',
            'recurring_frequency' => 'nullable|string|in:daily,weekly,monthly,quarterly,yearly',
            'metadata' => 'nullable|array'
        ]);

        $cost = $this->equipmentCostService->updateEquipmentCost($id, $validated);

        if (!$cost) {
            return response()->json([
                'success' => false,
                'message' => 'Equipment cost record not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $cost,
            'message' => 'Equipment cost record updated successfully'
        ]);
    }

    /**
     * Remove the specified equipment cost.
     */
    public function destroy(string $id): JsonResponse
    {
        $deleted = $this->equipmentCostService->deleteEquipmentCost($id);

        if (!$deleted) {
            return response()->json([
                'success' => false,
                'message' => 'Equipment cost record not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Equipment cost record deleted successfully'
        ]);
    }

    /**
     * Get costs for specific equipment.
     */
    public function equipmentCosts(string $equipmentId, Request $request): JsonResponse
    {
        $costs = $this->equipmentCostService->getEquipmentCostsByEquipment($equipmentId, $request->all());

        return response()->json([
            'success' => true,
            'data' => $costs,
            'message' => 'Equipment costs retrieved successfully'
        ]);
    }

    /**
     * Get cost summary by type.
     */
    public function costSummary(Request $request): JsonResponse
    {
        $summary = $this->equipmentCostService->getCostSummary($request->all());

        return response()->json([
            'success' => true,
            'data' => $summary,
            'message' => 'Cost summary retrieved successfully'
        ]);
    }

    /**
     * Get cost trends and analytics.
     */
    public function costTrends(Request $request): JsonResponse
    {
        $trends = $this->equipmentCostService->getCostTrends($request->all());

        return response()->json([
            'success' => true,
            'data' => $trends,
            'message' => 'Cost trends retrieved successfully'
        ]);
    }

    /**
     * Get budget vs actual costs comparison.
     */
    public function budgetComparison(Request $request): JsonResponse
    {
        $comparison = $this->equipmentCostService->getBudgetComparison($request->all());

        return response()->json([
            'success' => true,
            'data' => $comparison,
            'message' => 'Budget comparison retrieved successfully'
        ]);
    }

    /**
     * Generate cost report.
     */
    public function report(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'report_type' => 'required|string|in:summary,detailed,trends,budget',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
            'equipment_ids' => 'nullable|array',
            'cost_types' => 'nullable|array',
            'format' => 'nullable|string|in:json,csv,pdf'
        ]);

        $report = $this->equipmentCostService->generateCostReport($validated);

        return response()->json([
            'success' => true,
            'data' => $report,
            'message' => 'Cost report generated successfully'
        ]);
    }

    /**
     * Get recurring costs.
     */
    public function recurringCosts(Request $request): JsonResponse
    {
        $costs = $this->equipmentCostService->getRecurringCosts($request->all());

        return response()->json([
            'success' => true,
            'data' => $costs,
            'message' => 'Recurring costs retrieved successfully'
        ]);
    }

    /**
     * Process recurring cost.
     */
    public function processRecurringCost(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'process_date' => 'nullable|date',
            'amount_override' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:500'
        ]);

        $result = $this->equipmentCostService->processRecurringCost($id, $validated);

        return response()->json([
            'success' => true,
            'data' => $result,
            'message' => 'Recurring cost processed successfully'
        ]);
    }

    /**
     * Get cost categories.
     */
    public function categories(): JsonResponse
    {
        $categories = $this->equipmentCostService->getCostCategories();

        return response()->json([
            'success' => true,
            'data' => $categories,
            'message' => 'Cost categories retrieved successfully'
        ]);
    }
}
