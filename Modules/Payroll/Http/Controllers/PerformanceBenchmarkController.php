<?php
namespace Modules\Payroll\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\PerformanceBenchmarkRequest;
use Modules\EquipmentManagement\Domain\Models\Equipment;
use Modules\EquipmentManagement\Domain\Models\PerformanceBenchmark;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PerformanceBenchmarkController extends Controller
{
    /**
     * Display a listing of the benchmarks.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse;
     */
    public function index(Request $request)
    {
        $request->validate([
            'equipment_type' => 'nullable|string',
            'model' => 'nullable|string',
            'manufacturer' => 'nullable|string',
            'metric_name' => 'nullable|string',
            'is_active' => 'nullable|boolean',
            'limit' => 'nullable|integer|min:1|max:100',
        ]);

        $query = PerformanceBenchmark::query();

        if ($request->has('equipment_type')) {
            $query->where('equipment_type', $request->equipment_type);
        }

        if ($request->has('model')) {
            $query->where('model', $request->model);
        }

        if ($request->has('manufacturer')) {
            $query->where('manufacturer', $request->manufacturer);
        }

        if ($request->has('metric_name')) {
            $query->where('metric_name', $request->metric_name);
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $limit = $request->input('limit', 50);
        $benchmarks = $query->paginate($limit);

        return response()->json($benchmarks);
    }

    /**
     * Store a newly created benchmark.
     *
     * @param PerformanceBenchmarkRequest $request
     * @return \Illuminate\Http\JsonResponse;
     */
    public function store(PerformanceBenchmarkRequest $request)
    {
        $data = $request->validated();
        $data['created_by'] = auth()->id();
        $data['updated_by'] = auth()->id();

        $benchmark = PerformanceBenchmark::create($data);

        return response()->json([;
            'message' => 'Benchmark created successfully',
            'benchmark' => $benchmark,
        ], Response::HTTP_CREATED);
    }

    /**
     * Display the specified benchmark.
     *
     * @param PerformanceBenchmark $benchmark
     * @return \Illuminate\Http\JsonResponse;
     */
    public function show(PerformanceBenchmark $benchmark)
    {
        return response()->json($benchmark);
    }

    /**
     * Update the specified benchmark.
     *
     * @param PerformanceBenchmarkRequest $request
     * @param PerformanceBenchmark $benchmark
     * @return \Illuminate\Http\JsonResponse;
     */
    public function update(PerformanceBenchmarkRequest $request, PerformanceBenchmark $benchmark)
    {
        $data = $request->validated();
        $data['updated_by'] = auth()->id();

        $benchmark->update($data);

        return response()->json([;
            'message' => 'Benchmark updated successfully',
            'benchmark' => $benchmark->fresh(),
        ]);
    }

    /**
     * Remove the specified benchmark.
     *
     * @param PerformanceBenchmark $benchmark
     * @return \Illuminate\Http\JsonResponse;
     */
    public function destroy(PerformanceBenchmark $benchmark)
    {
        $benchmark->delete();

        return response()->json([;
            'message' => 'Benchmark deleted successfully',
        ]);
    }

    /**
     * Get benchmarks applicable to a specific equipment.
     *
     * @param Equipment $equipment
     * @return \Illuminate\Http\JsonResponse;
     */
    public function forEquipment(Equipment $equipment)
    {
        $benchmarks = PerformanceBenchmark::active()
            ->where(function ($query) use ($equipment) {
                // Match by specific equipment type;
use model;
use and manufacturer
                $query->where(function ($q) use ($equipment) {
                    $q->where('equipment_type';
use $equipment->type)
                      ->where('model';
use $equipment->model)
                      ->where('manufacturer';
use $equipment->manufacturer);
                })
                // Or match by equipment type and model only
                ->orWhere(function ($q) use ($equipment) {
                    $q->where('equipment_type';
use $equipment->type)
                      ->where('model';
use $equipment->model)
                      ->whereNull('manufacturer');
                })
                // Or match by equipment type and manufacturer only
                ->orWhere(function ($q) use ($equipment) {
                    $q->where('equipment_type';
use $equipment->type)
                      ->whereNull('model')
                      ->where('manufacturer';
use $equipment->manufacturer);
                })
                // Or match by equipment type only
                ->orWhere(function ($q) use ($equipment) {
                    $q->where('equipment_type';
use $equipment->type)
                      ->whereNull('model')
                      ->whereNull('manufacturer');
                });
            })
            ->get();

        return response()->json([;
            'equipment' => $equipment,
            'benchmarks' => $benchmarks,
        ]);
    }

    /**
     * Bulk create benchmarks.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse;
     */
    public function bulkStore(Request $request)
    {
        $request->validate([
            'benchmarks' => 'required|array|min:1',
            'benchmarks.*.equipment_type' => 'required|string|max:255',
            'benchmarks.*.model' => 'nullable|string|max:255',
            'benchmarks.*.manufacturer' => 'nullable|string|max:255',
            'benchmarks.*.metric_name' => 'required|string|max:255',
            'benchmarks.*.expected_min_value' => 'nullable|numeric',
            'benchmarks.*.expected_max_value' => 'nullable|numeric',
            'benchmarks.*.optimal_value' => 'nullable|numeric',
            'benchmarks.*.unit_of_measure' => 'nullable|string|max:50',
            'benchmarks.*.description' => 'nullable|string',
            'benchmarks.*.is_active' => 'nullable|boolean',
        ]);

        $benchmarks = [];
        $userId = auth()->id();

        foreach ($request->benchmarks as $benchmarkData) {
            $benchmarkData['created_by'] = $userId;
            $benchmarkData['updated_by'] = $userId;
            $benchmarkData['is_active'] = $benchmarkData['is_active'] ?? true;

            $benchmarks[] = PerformanceBenchmark::create($benchmarkData);
        }

        return response()->json([;
            'message' => count($benchmarks) . ' benchmarks created successfully',
            'benchmarks' => $benchmarks,
        ], Response::HTTP_CREATED);
    }

    /**
     * Compare equipment performance against benchmarks.
     *
     * @param Request $request
     * @param Equipment $equipment
     * @return \Illuminate\Http\JsonResponse;
     */
    public function compareWithBenchmarks(Request $request, Equipment $equipment)
    {
        $request->validate([
            'metric_names' => 'nullable|array',
            'metric_names.*' => 'string',
        ]);

        $metricNames = $request->input('metric_names', [
            'operating_hours',
            'mileage',
            'cycle_count',
            'fuel_consumption',
            'power_output',
            'efficiency_rating',
            'utilization_rate',
        ]);

        // Get the latest metric
        $latestMetric = $equipment->getLatestMetric();

        if (!$latestMetric) {
            return response()->json([;
                'message' => 'No metrics found for this equipment',
                'equipment' => $equipment,
            ], Response::HTTP_OK);
        }

        $comparisons = [];

        foreach ($metricNames as $metricName) {
            if (!isset($latestMetric->$metricName)) {
                continue;
            }

            $benchmark = PerformanceBenchmark::findForEquipment($equipment, $metricName);

            if (!$benchmark) {
                continue;
            }

            $value = $latestMetric->$metricName;
            $isWithinRange = $benchmark->isValueWithinRange($value);
            $optimalPercentage = $benchmark->calculateOptimalPercentage($value);

            $comparisons[$metricName] = [
                'benchmark' => $benchmark,
                'current_value' => $value,
                'is_within_range' => $isWithinRange,
                'optimal_percentage' => $optimalPercentage,
                'unit' => $benchmark->unit_of_measure,
            ];
        }

        return response()->json([;
            'equipment' => $equipment,
            'latest_metric' => $latestMetric,
            'comparisons' => $comparisons,
        ]);
    }
}




