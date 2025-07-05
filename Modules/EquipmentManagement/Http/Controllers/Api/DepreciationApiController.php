<?php

namespace Modules\EquipmentManagement\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Modules\EquipmentManagement\Services\DepreciationService;

class DepreciationApiController extends Controller
{
    protected $depreciationService;

    public function __construct(DepreciationService $depreciationService)
    {
        $this->depreciationService = $depreciationService;
    }

    /**
     * Display a listing of depreciation records.
     */
    public function index(Request $request): JsonResponse
    {
        $depreciations = $this->depreciationService->getDepreciationRecords($request->all());

        return response()->json([
            'success' => true,
            'data' => $depreciations,
            'message' => 'Depreciation records retrieved successfully'
        ]);
    }

    /**
     * Store a newly created depreciation record.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'equipment_id' => 'required|exists:equipment,id',
            'method' => 'required|string|in:straight_line,declining_balance,sum_of_years,units_of_production',
            'initial_value' => 'required|numeric|min:0',
            'salvage_value' => 'required|numeric|min:0',
            'useful_life_years' => 'required|integer|min:1',
            'useful_life_units' => 'nullable|integer|min:1',
            'depreciation_rate' => 'nullable|numeric|between:0,100',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date',
            'annual_depreciation' => 'nullable|numeric|min:0',
            'accumulated_depreciation' => 'nullable|numeric|min:0',
            'book_value' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:1000'
        ]);

        $depreciation = $this->depreciationService->createDepreciationRecord($validated);

        return response()->json([
            'success' => true,
            'data' => $depreciation,
            'message' => 'Depreciation record created successfully'
        ], 201);
    }

    /**
     * Display the specified depreciation record.
     */
    public function show(string $id): JsonResponse
    {
        $depreciation = $this->depreciationService->getDepreciationRecord($id);

        if (!$depreciation) {
            return response()->json([
                'success' => false,
                'message' => 'Depreciation record not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $depreciation,
            'message' => 'Depreciation record retrieved successfully'
        ]);
    }

    /**
     * Update the specified depreciation record.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'equipment_id' => 'sometimes|exists:equipment,id',
            'method' => 'sometimes|string|in:straight_line,declining_balance,sum_of_years,units_of_production',
            'initial_value' => 'sometimes|numeric|min:0',
            'salvage_value' => 'sometimes|numeric|min:0',
            'useful_life_years' => 'sometimes|integer|min:1',
            'useful_life_units' => 'nullable|integer|min:1',
            'depreciation_rate' => 'nullable|numeric|between:0,100',
            'start_date' => 'sometimes|date',
            'end_date' => 'nullable|date|after:start_date',
            'annual_depreciation' => 'nullable|numeric|min:0',
            'accumulated_depreciation' => 'nullable|numeric|min:0',
            'book_value' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:1000'
        ]);

        $depreciation = $this->depreciationService->updateDepreciationRecord($id, $validated);

        if (!$depreciation) {
            return response()->json([
                'success' => false,
                'message' => 'Depreciation record not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $depreciation,
            'message' => 'Depreciation record updated successfully'
        ]);
    }

    /**
     * Remove the specified depreciation record.
     */
    public function destroy(string $id): JsonResponse
    {
        $deleted = $this->depreciationService->deleteDepreciationRecord($id);

        if (!$deleted) {
            return response()->json([
                'success' => false,
                'message' => 'Depreciation record not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Depreciation record deleted successfully'
        ]);
    }

    /**
     * Calculate depreciation for equipment.
     */
    public function calculate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'equipment_id' => 'required|exists:equipment,id',
            'method' => 'required|string|in:straight_line,declining_balance,sum_of_years,units_of_production',
            'initial_value' => 'required|numeric|min:0',
            'salvage_value' => 'required|numeric|min:0',
            'useful_life_years' => 'required|integer|min:1',
            'useful_life_units' => 'nullable|integer|min:1',
            'depreciation_rate' => 'nullable|numeric|between:0,100',
            'calculation_date' => 'nullable|date'
        ]);

        $calculation = $this->depreciationService->calculateDepreciation($validated);

        return response()->json([
            'success' => true,
            'data' => $calculation,
            'message' => 'Depreciation calculated successfully'
        ]);
    }

    /**
     * Get depreciation schedule for equipment.
     */
    public function schedule(string $equipmentId, Request $request): JsonResponse
    {
        $schedule = $this->depreciationService->getDepreciationSchedule($equipmentId, $request->all());

        return response()->json([
            'success' => true,
            'data' => $schedule,
            'message' => 'Depreciation schedule retrieved successfully'
        ]);
    }

    /**
     * Get current book value for equipment.
     */
    public function bookValue(string $equipmentId): JsonResponse
    {
        $bookValue = $this->depreciationService->getCurrentBookValue($equipmentId);

        return response()->json([
            'success' => true,
            'data' => [
                'equipment_id' => $equipmentId,
                'book_value' => $bookValue,
                'calculation_date' => now()->toDateString()
            ],
            'message' => 'Book value retrieved successfully'
        ]);
    }

    /**
     * Process monthly depreciation.
     */
    public function processMonthly(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'process_date' => 'nullable|date',
            'equipment_ids' => 'nullable|array',
            'equipment_ids.*' => 'exists:equipment,id'
        ]);

        $result = $this->depreciationService->processMonthlyDepreciation($validated);

        return response()->json([
            'success' => true,
            'data' => $result,
            'message' => 'Monthly depreciation processed successfully'
        ]);
    }

    /**
     * Get depreciation summary.
     */
    public function summary(Request $request): JsonResponse
    {
        $summary = $this->depreciationService->getDepreciationSummary($request->all());

        return response()->json([
            'success' => true,
            'data' => $summary,
            'message' => 'Depreciation summary retrieved successfully'
        ]);
    }

    /**
     * Generate depreciation report.
     */
    public function report(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'report_type' => 'required|string|in:summary,detailed,schedule,comparison',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
            'equipment_ids' => 'nullable|array',
            'equipment_ids.*' => 'exists:equipment,id',
            'methods' => 'nullable|array',
            'format' => 'nullable|string|in:json,csv,pdf'
        ]);

        $report = $this->depreciationService->generateDepreciationReport($validated);

        return response()->json([
            'success' => true,
            'data' => $report,
            'message' => 'Depreciation report generated successfully'
        ]);
    }

    /**
     * Get depreciation methods.
     */
    public function methods(): JsonResponse
    {
        $methods = $this->depreciationService->getDepreciationMethods();

        return response()->json([
            'success' => true,
            'data' => $methods,
            'message' => 'Depreciation methods retrieved successfully'
        ]);
    }

    /**
     * Recalculate depreciation for equipment.
     */
    public function recalculate(string $equipmentId, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'recalculation_date' => 'nullable|date',
            'update_records' => 'boolean'
        ]);

        $result = $this->depreciationService->recalculateDepreciation($equipmentId, $validated);

        return response()->json([
            'success' => true,
            'data' => $result,
            'message' => 'Depreciation recalculated successfully'
        ]);
    }

    /**
     * Get depreciation trends.
     */
    public function trends(Request $request): JsonResponse
    {
        $trends = $this->depreciationService->getDepreciationTrends($request->all());

        return response()->json([
            'success' => true,
            'data' => $trends,
            'message' => 'Depreciation trends retrieved successfully'
        ]);
    }
}
