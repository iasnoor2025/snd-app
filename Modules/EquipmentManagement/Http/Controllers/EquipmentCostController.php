<?php
namespace Modules\EquipmentManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use Modules\EquipmentManagement\Http\Requests\EquipmentCostRequest;
use Modules\EquipmentManagement\Domain\Models\Equipment;
use Modules\EquipmentManagement\Domain\Models\EquipmentCostRecord;
use Modules\EquipmentManagement\Services\PerformanceTrackingService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class EquipmentCostController extends Controller
{
    /**
     * The performance tracking service.
     *
     * @var PerformanceTrackingService
     */
    protected $performanceService;

    /**
     * Create a new controller instance.
     *
     * @param PerformanceTrackingService $performanceService
     * @return void
     */
    public function __construct(PerformanceTrackingService $performanceService)
    {
        $this->performanceService = $performanceService;
    }

    /**
     * Display a listing of costs for an equipment.
     *
     * @param Request $request
     * @param Equipment $equipment
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request, Equipment $equipment)
    {
        $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'cost_type' => 'nullable|string',
            'limit' => 'nullable|integer|min:1|max:100',
        ]);

        $query = $equipment->costRecords()->orderBy('date', 'desc');

        if ($request->has('start_date')) {
            $query->where('date', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->where('date', '<=', $request->end_date);
        }

        if ($request->has('cost_type')) {
            $query->where('cost_type', $request->cost_type);
        }

        $limit = $request->input('limit', 50);
        $costs = $query->paginate($limit);

        return response()->json([
            'equipment' => $equipment,
            'costs' => $costs,
            'cost_types' => EquipmentCostRecord::getAvailableTypes(),
        ]);
    }

    /**
     * Store a newly recorded cost.
     *
     * @param EquipmentCostRequest $request
     * @param Equipment $equipment
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(EquipmentCostRequest $request, Equipment $equipment)
    {
        $data = $request->validated();
        $data['date'] = $data['date'] ?? Carbon::now();

        $cost = $this->performanceService->recordCost($equipment, $data, auth()->id());

        return response()->json([
            'message' => 'Cost recorded successfully',
            'cost' => $cost,
            'equipment' => $equipment->fresh(),
        ], Response::HTTP_CREATED);
    }

    /**
     * Display the specified cost record.
     *
     * @param Equipment $equipment
     * @param EquipmentCostRecord $cost
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Equipment $equipment, EquipmentCostRecord $cost)
    {
        if ($cost->equipment_id !== $equipment->id) {
            return response()->json([
                'message' => 'The specified cost record does not belong to this equipment',
            ], Response::HTTP_BAD_REQUEST);
        }

        return response()->json([
            'equipment' => $equipment,
            'cost' => $cost,
        ]);
    }

    /**
     * Update the specified cost record.
     *
     * @param EquipmentCostRequest $request
     * @param Equipment $equipment
     * @param EquipmentCostRecord $cost
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(EquipmentCostRequest $request, Equipment $equipment, EquipmentCostRecord $cost)
    {
        if ($cost->equipment_id !== $equipment->id) {
            return response()->json([
                'message' => 'The specified cost record does not belong to this equipment',
            ], Response::HTTP_BAD_REQUEST);
        }

        $data = $request->validated();
        $data['updated_by'] = auth()->id();

        $oldCostType = $cost->cost_type;
        $newCostType = $data['cost_type'] ?? $oldCostType;

        $cost->update($data);

        // Update equipment cost calculations if cost type changed or amount changed
        if ($oldCostType !== $newCostType ||
            (isset($data['amount']) && $data['amount'] != $cost->getOriginal('amount'))) {

            $equipment->updateLifetimeMaintenanceCost();
            $equipment->updateOperatingCosts();
        }

        return response()->json([
            'message' => 'Cost record updated successfully',
            'cost' => $cost->fresh(),
            'equipment' => $equipment->fresh(),
        ]);
    }

    /**
     * Remove the specified cost record.
     *
     * @param Equipment $equipment
     * @param EquipmentCostRecord $cost
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Equipment $equipment, EquipmentCostRecord $cost)
    {
        if ($cost->equipment_id !== $equipment->id) {
            return response()->json([
                'message' => 'The specified cost record does not belong to this equipment',
            ], Response::HTTP_BAD_REQUEST);
        }

        $costType = $cost->cost_type;
        $cost->delete();

        // Update equipment cost calculations
        $equipment->updateLifetimeMaintenanceCost();
        $equipment->updateOperatingCosts();

        return response()->json([
            'message' => 'Cost record deleted successfully',
            'equipment' => $equipment->fresh(),
        ]);
    }

    /**
     * Get cost summary by type for an equipment.
     *
     * @param Request $request
     * @param Equipment $equipment
     * @return \Illuminate\Http\JsonResponse
     */
    public function summary(Request $request, Equipment $equipment)
    {
        $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $query = $equipment->costRecords();

        if ($request->has('start_date')) {
            $query->where('date', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->where('date', '<=', $request->end_date);
        }

        $costs = $query->get();
        $totalCost = $costs->sum('amount');

        // Group by cost type
        $costsByType = $costs->groupBy('cost_type');

        $summary = [];
        foreach ($costsByType as $type => $records) {
            $typeTotal = $records->sum('amount');
            $summary[$type] = [
                'amount' => $typeTotal,
                'percentage' => $totalCost > 0 ? ($typeTotal / $totalCost) * 100 : 0,
                'count' => $records->count(),
            ];
        }

        // Calculate per hour and per mile costs if applicable
        $perHourCost = null;
        $perMileCost = null;

        if ($equipment->current_operating_hours > 0) {
            $perHourCost = $totalCost / $equipment->current_operating_hours;
        }

        if ($equipment->current_mileage > 0) {
            $perMileCost = $totalCost / $equipment->current_mileage;
        }

        return response()->json([
            'equipment' => $equipment,
            'total_cost' => $totalCost,
            'cost_summary' => $summary,
            'cost_per_hour' => $perHourCost,
            'cost_per_mile' => $perMileCost,
            'period' => [
                'start_date' => $request->start_date ?? $costs->min('date'),
                'end_date' => $request->end_date ?? $costs->max('date'),
            ],
        ]);
    }
}


