<?php

namespace Modules\EquipmentManagement\Http\Controllers;

use Modules\EquipmentManagement\Domain\Models\Equipment;
use Modules\EquipmentManagement\Services\PerformanceTrackingService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class EquipmentPerformanceController extends Controller
{
    protected PerformanceTrackingService $performanceService;

    public function __construct(PerformanceTrackingService $performanceService)
    {
        $this->performanceService = $performanceService;
    }

    /**
     * Display equipment performance dashboard
     */
    public function index(Equipment $equipment, Request $request)
    {
        $startDate = $request->input('start_date') ? Carbon::parse($request->input('start_date')) : now()->subYear();
        $endDate = $request->input('end_date') ? Carbon::parse($request->input('end_date')) : now();

        $metrics = $this->performanceService->getPerformanceMetrics($equipment, $startDate, $endDate);
        $trends = $this->performanceService->getPerformanceTrends($equipment);

        return Inertia::render('Equipment/Performance/Index', [
            'equipment' => $equipment->load('category'),
            'metrics' => $metrics,
            'trends' => $trends,
            'start_date' => $startDate,
            'end_date' => $endDate
        ]);
    }

    /**
     * Get utilization rate
     */
    public function getUtilizationRate(Equipment $equipment, Request $request)
    {
        $startDate = $request->input('start_date') ? Carbon::parse($request->input('start_date')) : now()->subYear();
        $endDate = $request->input('end_date') ? Carbon::parse($request->input('end_date')) : now();

        $utilizationRate = $this->performanceService->calculateUtilizationRate($equipment, $startDate, $endDate);

        return response()->json([
            'utilization_rate' => $utilizationRate
        ]);
    }

    /**
     * Get efficiency metrics
     */
    public function getEfficiency(Equipment $equipment, Request $request)
    {
        $startDate = $request->input('start_date') ? Carbon::parse($request->input('start_date')) : now()->subYear();
        $endDate = $request->input('end_date') ? Carbon::parse($request->input('end_date')) : now();

        $efficiency = $this->performanceService->calculateEfficiency($equipment, $startDate, $endDate);

        return response()->json($efficiency);
    }

    /**
     * Get performance metrics
     */
    public function getMetrics(Equipment $equipment, Request $request)
    {
        $startDate = $request->input('start_date') ? Carbon::parse($request->input('start_date')) : now()->subYear();
        $endDate = $request->input('end_date') ? Carbon::parse($request->input('end_date')) : now();

        $metrics = $this->performanceService->getPerformanceMetrics($equipment, $startDate, $endDate);

        return response()->json($metrics);
    }

    /**
     * Get performance trends
     */
    public function getTrends(Equipment $equipment, Request $request)
    {
        $months = $request->input('months', 12);
        $trends = $this->performanceService->getPerformanceTrends($equipment, $months);

        return response()->json($trends);
    }

    /**
     * Get performance summary for dashboard
     */
    public function getSummary()
    {
        $equipment = Equipment::all();
        $summary = [];

        foreach ($equipment as $item) {
            $metrics = $this->performanceService->getPerformanceMetrics($item);
            $summary[] = [
                'equipment' => $item,
                'utilization_rate' => $metrics['utilization_rate'],
                'overall_performance' => $metrics['overall_performance'],
                'cost_efficiency' => $metrics['efficiency']['cost_efficiency']
            ];
        }

        return response()->json([
            'summary' => $summary,
            'average_utilization' => collect($summary)->avg('utilization_rate'),
            'average_performance' => collect($summary)->avg('overall_performance'),
            'average_efficiency' => collect($summary)->avg('cost_efficiency')
        ]);
    }

    /**
     * Get performance comparison
     */
    public function getComparison(Request $request)
    {
        $request->validate([
            'equipment_ids' => 'required|array',
            'equipment_ids.*' => 'exists:equipment,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date'
        ]);

        $startDate = Carbon::parse($request->start_date);
        $endDate = Carbon::parse($request->end_date);
        $comparison = [];

        foreach ($request->equipment_ids as $equipmentId) {
            $equipment = Equipment::findOrFail($equipmentId);
            $metrics = $this->performanceService->getPerformanceMetrics($equipment, $startDate, $endDate);

            $comparison[] = [
                'equipment' => $equipment,
                'metrics' => $metrics
            ];
        }

        return response()->json($comparison);
    }
}


