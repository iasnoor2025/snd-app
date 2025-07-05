<?php

namespace Modules\EquipmentManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use Modules\EquipmentManagement\Domain\Models\Equipment;
use Modules\EquipmentManagement\Domain\Models\EquipmentDepreciation;
use Modules\EquipmentManagement\Domain\Models\EquipmentValuationRecord;
use Modules\EquipmentManagement\Services\DepreciationTrackingService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class DepreciationController extends Controller
{
    protected $depreciationService;

    /**
     * Create a new controller instance.
     *
     * @param DepreciationTrackingService $depreciationService
     * @return void;
     */
    public function __construct(DepreciationTrackingService $depreciationService)
    {
        $this->depreciationService = $depreciationService;
    }

    /**
     * Setup depreciation for equipment.
     *
     * @param Request $request
     * @param int $equipmentId
     * @return JsonResponse;
     */
    public function setupDepreciation(Request $request, int $equipmentId): JsonResponse
    {
        // Validate request
        $validator = Validator::make($request->all(), [
            'initial_value' => 'nullable|numeric|min:0',
            'residual_value' => 'nullable|numeric|min:0',
            'depreciation_method' => 'nullable|string|in:' . implode(',', array_keys(EquipmentDepreciation::getAvailableMethods())),
            'useful_life_years' => 'nullable|integer|min:1|max:50',
            'depreciation_start_date' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $userId = auth()->id();
            $depreciation = $this->depreciationService->setupDepreciation($equipmentId, $request->all(), $userId);

            return response()->json([
                'message' => 'Depreciation setup successfully',
                'depreciation' => $depreciation,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to setup depreciation',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update depreciation settings.
     *
     * @param Request $request
     * @param int $depreciationId
     * @return JsonResponse;
     */
    public function updateDepreciation(Request $request, int $depreciationId): JsonResponse
    {
        // Validate request
        $validator = Validator::make($request->all(), [
            'residual_value' => 'nullable|numeric|min:0',
            'depreciation_method' => 'nullable|string|in:' . implode(',', array_keys(EquipmentDepreciation::getAvailableMethods())),
            'useful_life_years' => 'nullable|integer|min:1|max:50',
            'depreciation_start_date' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $userId = auth()->id();
            $depreciation = $this->depreciationService->updateDepreciation($depreciationId, $request->all(), $userId);

            return response()->json([
                'message' => 'Depreciation updated successfully',
                'depreciation' => $depreciation,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update depreciation',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Calculate current value of equipment.
     *
     * @param Request $request
     * @param int $equipmentId
     * @return JsonResponse;
     */
    public function calculateCurrentValue(Request $request, int $equipmentId): JsonResponse
    {
        // Validate request
        $validator = Validator::make($request->all(), [
            'as_of_date' => 'nullable|date'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $asOfDate = $request->input('as_of_date');
            $result = $this->depreciationService->calculateCurrentValue($equipmentId, $asOfDate);

            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to calculate current value',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Record a new valuation for equipment.
     *
     * @param Request $request
     * @param int $equipmentId
     * @return JsonResponse;
     */
    public function recordValuation(Request $request, int $equipmentId): JsonResponse
    {
        // Validate request
        $validator = Validator::make($request->all(), [
            'valuation_date' => 'nullable|date',
            'valuation_amount' => 'required|numeric|min:0',
            'valuation_method' => 'required|string|in:' . implode(',', array_keys(EquipmentValuationRecord::getAvailableMethods())),
            'valuation_type' => 'required|string|in:' . implode(',', array_keys(EquipmentValuationRecord::getAvailableTypes())),
            'appraiser_name' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $userId = auth()->id();
            $valuation = $this->depreciationService->recordValuation($equipmentId, $request->all(), $userId);

            return response()->json([
                'message' => 'Valuation recorded successfully',
                'valuation' => $valuation,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to record valuation',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get depreciation report for equipment.
     *
     * @param int $equipmentId
     * @return JsonResponse;
     */
    public function getDepreciationReport(int $equipmentId): JsonResponse
    {
        try {
            $report = $this->depreciationService->generateDepreciationReport($equipmentId);

            return response()->json($report);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to generate depreciation report',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get fleet-wide depreciation summary.
     *
     * @param Request $request
     * @return JsonResponse;
     */
    public function getFleetDepreciationSummary(Request $request): JsonResponse
    {
        // Validate request
        $validator = Validator::make($request->all(), [
            'category_id' => 'nullable|integer|exists:equipment_categories,id',
            'status' => 'nullable|string',
            'is_fully_depreciated' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $filters = $request->only(['category_id', 'status', 'is_fully_depreciated']);
            $summary = $this->depreciationService->generateFleetDepreciationSummary($filters);

            return response()->json($summary);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to generate fleet depreciation summary',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get valuation history for equipment.
     *
     * @param int $equipmentId
     * @return JsonResponse;
     */
    public function getValuationHistory(int $equipmentId): JsonResponse
    {
        try {
            $equipment = Equipment::with(['valuationRecords' => function ($query) {
                $query->orderBy('valuation_date', 'desc');
            }])->findOrFail($equipmentId);

            return response()->json([
                'equipment' => [
                    'id' => $equipment->id,
                    'name' => $equipment->name,
                ],
                'valuations' => $equipment->valuationRecords->map(function ($valuation) {
                    return [
                        'id' => $valuation->id,
                        'valuation_date' => $valuation->valuation_date,
                        'valuation_amount' => $valuation->valuation_amount,
                        'valuation_method' => $valuation->valuation_method,
                        'valuation_type' => $valuation->valuation_type,
                        'appraiser_name' => $valuation->appraiser_name,
                        'notes' => $valuation->notes,
                        'created_at' => $valuation->created_at?->format('Y-m-d H:i:s'),
                    ];
                }),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to get valuation history',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get equipment needing replacement.
     *
     * @param Request $request
     * @return JsonResponse;
     */
    public function getEquipmentNeedingReplacement(Request $request): JsonResponse
    {
        // Validate request
        $validator = Validator::make($request->all(), [
            'category_id' => 'nullable|integer|exists:equipment_categories,id',
            'limit' => 'nullable|integer|min:1|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $categoryId = $request->input('category_id');
            $limit = $request->input('limit', 50);

            $query = Equipment::with('depreciation')
                ->where(function ($query) {
                    $query->where('is_fully_depreciated', true)
                        ->orWhereHas('depreciation', function ($q) {
                            $q->whereNotNull('fully_depreciated_date');
                        });
                });

            if ($categoryId) {
                $query->where('category_id', $categoryId);
            }

            $equipment = $query->limit($limit)->get();

            $needingReplacement = [];
            foreach ($equipment as $item) {
                if ($item->shouldConsiderReplacement()) {
                    $needingReplacement[] = [
                        'id' => $item->id,
                        'name' => $item->name,
                        'category' => $item->category->name ?? 'Uncategorized',
                        'current_value' => $item->depreciated_value,
                        'replacement_cost' => $item->replacement_cost_estimate ?? $item->calculateReplacementCost(),
                        'is_fully_depreciated' => $item->is_fully_depreciated,
                        'remaining_life' => $item->getRemainingUsefulLife(),
                        'purchase_date' => $item->purchase_date,
                        'purchase_cost' => $item->purchase_cost,
                    ];
                }
            }

            return response()->json([
                'count' => count($needingReplacement),
                'equipment' => $needingReplacement,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to get equipment needing replacement',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}


