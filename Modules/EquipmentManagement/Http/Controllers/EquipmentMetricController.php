<?php
namespace Modules\EquipmentManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\EquipmentMetricRequest;
use Modules\EquipmentManagement\Domain\Models\Equipment;
use Modules\EquipmentManagement\Domain\Models\EquipmentMetric;
use Modules\EquipmentManagement\Services\PerformanceTrackingService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class EquipmentMetricController extends Controller
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
     * @return void;
     */
    public function __construct(PerformanceTrackingService $performanceService)
    {
        $this->performanceService = $performanceService;
    }

    /**
     * Display a listing of metrics for an equipment.
     *
     * @param Request $request
     * @param Equipment $equipment
     * @return \Illuminate\Http\JsonResponse;
     */
    public function index(Request $request, Equipment $equipment)
    {
        $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'limit' => 'nullable|integer|min:1|max:100',
        ]);

        $query = $equipment->metrics()->orderBy('recorded_at', 'desc');

        if ($request->has('start_date')) {
            $query->where('recorded_at', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->where('recorded_at', '<=', $request->end_date);
        }

        $limit = $request->input('limit', 50);
        $metrics = $query->paginate($limit);

        return response()->json([
            'equipment' => $equipment,
            'metrics' => $metrics,
        ]);
    }

    /**
     * Store a newly recorded metric.
     *
     * @param EquipmentMetricRequest $request
     * @param Equipment $equipment
     * @return \Illuminate\Http\JsonResponse;
     */
    public function store(EquipmentMetricRequest $request, Equipment $equipment)
    {
        $data = $request->validated();
        $data['recorded_at'] = $data['recorded_at'] ?? Carbon::now();

        $metric = $this->performanceService->recordMetrics($equipment, $data, auth()->id());

        return response()->json([
            'message' => 'Metric recorded successfully',
            'metric' => $metric,
            'equipment' => $equipment->fresh(),
        ], Response::HTTP_CREATED);
    }

    /**
     * Display the specified metric.
     *
     * @param Equipment $equipment
     * @param EquipmentMetric $metric
     * @return \Illuminate\Http\JsonResponse;
     */
    public function show(Equipment $equipment, EquipmentMetric $metric)
    {
        if ($metric->equipment_id !== $equipment->id) {
            return response()->json([
                'message' => 'The specified metric does not belong to this equipment',
            ], Response::HTTP_BAD_REQUEST);
        }

        return response()->json([
            'equipment' => $equipment,
            'metric' => $metric,
        ]);
    }

    /**
     * Update the specified metric.
     *
     * @param EquipmentMetricRequest $request
     * @param Equipment $equipment
     * @param EquipmentMetric $metric
     * @return \Illuminate\Http\JsonResponse;
     */
    public function update(EquipmentMetricRequest $request, Equipment $equipment, EquipmentMetric $metric)
    {
        if ($metric->equipment_id !== $equipment->id) {
            return response()->json([
                'message' => 'The specified metric does not belong to this equipment',
            ], Response::HTTP_BAD_REQUEST);
        }

        $data = $request->validated();
        $metric->update($data);

        // Update equipment metrics if this is the latest metric
        $latestMetric = $equipment->getLatestMetric();
        if ($latestMetric && $latestMetric->id === $metric->id) {
            $equipment->updateCurrentMetrics($metric->toArray());
            $equipment->calculateUsageStatistics();
            $equipment->calculateEfficiencyRating();
        }

        return response()->json([
            'message' => 'Metric updated successfully',
            'metric' => $metric->fresh(),
            'equipment' => $equipment->fresh(),
        ]);
    }

    /**
     * Remove the specified metric.
     *
     * @param Equipment $equipment
     * @param EquipmentMetric $metric
     * @return \Illuminate\Http\JsonResponse;
     */
    public function destroy(Equipment $equipment, EquipmentMetric $metric)
    {
        if ($metric->equipment_id !== $equipment->id) {
            return response()->json([
                'message' => 'The specified metric does not belong to this equipment',
            ], Response::HTTP_BAD_REQUEST);
        }

        $metric->delete();

        // If this was the latest metric, update the equipment with the new latest metric
        $newLatestMetric = $equipment->getLatestMetric();
        if ($newLatestMetric) {
            $equipment->updateCurrentMetrics($newLatestMetric->toArray());
            $equipment->calculateUsageStatistics();
            $equipment->calculateEfficiencyRating();
        }

        return response()->json([
            'message' => 'Metric deleted successfully',
            'equipment' => $equipment->fresh(),
        ]);
    }

    /**
     * Get performance metrics for an equipment over a time period.
     *
     * @param Request $request
     * @param Equipment $equipment
     * @return \Illuminate\Http\JsonResponse;
     */
    public function performance(Request $request, Equipment $equipment)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $metrics = $this->performanceService->getPerformanceMetrics(
            $equipment,
            $request->start_date,
            $request->end_date
        );

        return response()->json($metrics);
    }

    /**
     * Get lifetime performance metrics for an equipment.
     *
     * @param Equipment $equipment
     * @return \Illuminate\Http\JsonResponse;
     */
    public function lifetime(Equipment $equipment)
    {
        $metrics = $this->performanceService->getLifetimePerformanceMetrics($equipment);

        return response()->json($metrics);
    }

    /**
     * Generate a performance report for an equipment.
     *
     * @param Request $request
     * @param Equipment $equipment
     * @return \Illuminate\Http\JsonResponse;
     */
    public function report(Request $request, Equipment $equipment)
    {
        $request->validate([
            'period' => 'required|string|in:daily,weekly,monthly,quarterly,yearly,custom',
            'start_date' => 'required_if:period,custom|date',
            'end_date' => 'required_if:period,custom|date|after_or_equal:start_date',
        ]);

        $report = $this->performanceService->generatePerformanceReport(
            $equipment,
            $request->period,
            $request->start_date,
            $request->end_date
        );

        return response()->json($report);
    }

    /**
     * Schedule a performance review for an equipment.
     *
     * @param Request $request
     * @param Equipment $equipment
     * @return \Illuminate\Http\JsonResponse;
     */
    public function scheduleReview(Request $request, Equipment $equipment)
    {
        $request->validate([
            'review_date' => 'required|date|after:now'
        ]);

        $reviewDate = Carbon::parse($request->review_date);
        $this->performanceService->schedulePerformanceReview($equipment, $reviewDate);

        return response()->json([
            'message' => 'Performance review scheduled successfully',
            'equipment' => $equipment->fresh(),
        ]);
    }
}


